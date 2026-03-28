export function mergeObjectDeep(target, ...sources) {
  const isPlainObject = (object) => Object.prototype.toString.call(object) === '[object Object]';
  const structuredCloneSafe = (object, cache) => {
    try {
      return structuredClone(object);
    } catch {
      return Array.isArray(object) ? [...object] : isPlainObject(object) ? merge({}, object, cache) : object;
    }
  };
  const merge = (t, source, cache) => {
    if (!source || typeof source !== 'object') return t;
    if (cache.has(source)) return cache.get(source);
    cache.set(source, t);
    Object.entries(source).forEach(([key, sourceValue]) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
      const targetValue = t[key];
      t[key] = isPlainObject(sourceValue) && isPlainObject(targetValue) ? merge(targetValue, sourceValue, cache) : structuredCloneSafe(sourceValue, cache);
    });
    return t;
  };
  const cache = new WeakMap();
  sources.forEach((source) => merge(target, source, cache));
  return target;
}
