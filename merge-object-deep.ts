type PlainObject = Record<string, unknown>;
type UnionToIntersection<U> = (U extends unknown ? (_: U) => unknown : never) extends (_: infer I) => unknown ? I : never;
type Cache = WeakMap<object, PlainObject>;

export function mergeObjectDeep<T extends PlainObject, U extends PlainObject[]>(target: T, ...sources: U): T & UnionToIntersection<U[number]> {
  const cache: Cache = new WeakMap();
  sources.forEach((source) => merge(target, source, cache));
  return target as T & UnionToIntersection<U[number]>;
}

function merge(target: PlainObject, source: unknown, cache: Cache): PlainObject {
  if (!source || typeof source !== 'object') return target;
  if (!isPlainObject(source)) return target;
  if (cache.has(source)) return cache.get(source) ?? target;
  cache.set(source, target);
  Object.entries(source).forEach(([key, sourceValue]) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
    const targetValue = target[key];
    target[key] = isPlainObject(sourceValue) && isPlainObject(targetValue) ? merge(targetValue, sourceValue, cache) : structuredCloneSafe(sourceValue, cache);
  });
  return target;
}

function isPlainObject(value: unknown): value is PlainObject {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function structuredCloneSafe(value: unknown, cache: Cache): unknown {
  try {
    return structuredClone(value);
  } catch {
    if (Array.isArray(value)) {
      const array: unknown[] = new Array(value.length);
      value.forEach((item, i) => {
        array[i] = item;
      });
      return array;
    }
    if (isPlainObject(value)) {
      return merge({}, value, cache);
    }
    return value;
  }
}
