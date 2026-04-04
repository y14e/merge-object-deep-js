type PlainObject = Record<string, unknown>;
type UnionToIntersection<U> = (U extends unknown ? (_: U) => unknown : never) extends (_: infer I) => unknown ? I : never;
type Cache = WeakMap<PlainObject, PlainObject>;

export function mergeObjectDeep<T extends PlainObject, U extends unknown[]>(target: T, ...sources: U): T & UnionToIntersection<Extract<U[number], PlainObject>> {
  const cache: Cache = new WeakMap();
  for (const source of sources) {
    if (isPlainObject(source)) {
      merge(target, source, cache);
    }
  }
  return target as T & UnionToIntersection<Extract<U[number], PlainObject>>;
}

function getCache(cache: Cache, key: PlainObject): PlainObject {
  const value = cache.get(key);
  if (!value) throw new Error('Cache key missing');
  return value;
}

const objectProto = Object.prototype;

function isPlainObject(value: unknown): value is PlainObject {
  if (!value || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === objectProto;
}

function merge(target: PlainObject, source: PlainObject, cache: Cache): void {
  if (cache.has(source)) return;
  cache.set(source, target);
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    const sourceValue = source[key];
    const targetValue = target[key];
    if (isPlainObject(sourceValue)) {
      if (cache.has(sourceValue)) {
        target[key] = getCache(cache, sourceValue);
        continue;
      }
      if (isPlainObject(targetValue)) {
        merge(targetValue, sourceValue, cache);
      } else {
        const next: PlainObject = {};
        cache.set(sourceValue, next);
        merge(next, sourceValue, cache);
        target[key] = next;
      }
      continue;
    }
    target[key] = structuredCloneSafe(sourceValue);
  }
}

function structuredCloneSafe(value: unknown) {
  if (value === null || typeof value !== 'object') return value;
  try {
    return structuredClone(value);
  } catch {
    if (Array.isArray(value)) {
      const result = [];
      for (const item of value) {
        result.push(item);
      }
      return result;
    }
    if (isPlainObject(value)) {
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(value)) {
        result[key] = value[key];
      }
      return result;
    }
    return value;
  }
}
