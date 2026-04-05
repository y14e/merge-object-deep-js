type PlainObject = Record<string, unknown>;
type UnionToIntersection<U> = (U extends unknown ? (_: U) => unknown : never) extends (_: infer I) => unknown ? I : never;
type CircularRef = WeakMap<PlainObject, PlainObject>;

export function mergeObjectDeep<T extends PlainObject, U extends unknown[]>(target: T, ...sources: U): T & UnionToIntersection<Extract<U[number], PlainObject>> {
  const ref: CircularRef = new WeakMap();
  for (const source of sources) {
    if (isPlainObject(source)) {
      merge(target, source, ref);
    }
  }
  return target as T & UnionToIntersection<Extract<U[number], PlainObject>>;
}

function merge(target: PlainObject, source: PlainObject, ref: CircularRef): void {
  if (ref.has(source)) return;
  ref.set(source, target);
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    const sourceValue = source[key];
    const targetValue = target[key];
    if (isPlainObject(sourceValue)) {
      if (ref.has(sourceValue)) {
        target[key] = getCache(ref, sourceValue);
        continue;
      }
      if (isPlainObject(targetValue)) {
        merge(targetValue, sourceValue, ref);
      } else {
        const clone: PlainObject = {};
        ref.set(sourceValue, clone);
        merge(clone, sourceValue, ref);
        target[key] = clone;
      }
      continue;
    }
    target[key] = structuredCloneSafe(sourceValue);
  }
}

function getCache(ref: CircularRef, key: PlainObject): PlainObject {
  const value = ref.get(key);
  if (!value) throw new Error('Cache key missing');
  return value;
}

const objectProto = Object.prototype;

function isPlainObject(value: unknown): value is PlainObject {
  if (!value || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === objectProto;
}

function structuredCloneSafe(value: unknown) {
  if (value === null || typeof value !== 'object') return value;
  try {
    return structuredClone(value);
  } catch {
    if (Array.isArray(value)) {
      const result: unknown[] = [];
      for (const v of value) {
        result.push(v);
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
