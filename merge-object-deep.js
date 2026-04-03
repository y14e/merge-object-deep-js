export function mergeObjectDeep(target, ...sources) {
  const isPlainObject = (object) => Object.prototype.toString.call(object) === '[object Object]';
  const structuredCloneSafe = (object, cache) => {
    try {
      return structuredClone(object);
    } catch {
      if (Array.isArray(object)) {
        const array = new Array(object.length);
        object.forEach((item, i) => {
          array[i] = item;
        });
        return array;
      }
      if (isPlainObject(object)) {
        return merge({}, object, cache);
      }
      return object;
    }
  };
  const merge = (target, source, cache) => {
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
  };
  const cache = new WeakMap();
  sources.forEach((source) => merge(target, source, cache));
  return target;
}
