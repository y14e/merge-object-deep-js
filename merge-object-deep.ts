type PlainObject = Record<string, unknown>;
type UnionToIntersection<U> = (U extends unknown ? (_: U) => unknown : never) extends (_: infer I) => unknown ? I : never;
type SeenMap = WeakMap<object, PlainObject>;

export function mergeObjectDeep<T extends PlainObject, U extends PlainObject[]>(target: T, ...sources: U): T & UnionToIntersection<U[number]> {
  const isPlainObject = (object: unknown): object is PlainObject => Object.prototype.toString.call(object) === '[object Object]';
  const structuredCloneSafe = (object: unknown, seen: SeenMap): unknown => {
    try {
      return structuredClone(object);
    } catch {
      return Array.isArray(object) ? [...object] : isPlainObject(object) ? merge({}, object, seen) : object;
    }
  };
  const merge = (target: PlainObject, source: unknown, seen: SeenMap): PlainObject => {
    if (!source || typeof source !== 'object') {
      return target;
    }
    if (seen.has(source)) {
      return seen.get(source)!;
    }
    seen.set(source, target);
    Object.entries(source as PlainObject).forEach(([key, sourceValue]) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }
      const targetValue = target[key];
      target[key] = isPlainObject(sourceValue) && isPlainObject(targetValue) ? merge(targetValue, sourceValue, seen) : structuredCloneSafe(sourceValue, seen);
    });
    return target;
  };
  const seen: SeenMap = new WeakMap();
  sources.forEach((source) => merge(target, source, seen));
  return target as T & UnionToIntersection<U[number]>;
}
