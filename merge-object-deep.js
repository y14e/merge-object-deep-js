export function mergeObjectDeep(target, ...sources) {
  const isPlainObject = (object) => Object.prototype.toString.call(object) === '[object Object]';
  const structuredCloneSafe = (object, seen) => {
    try {
      return structuredClone(object);
    } catch {
      return Array.isArray(object) ? [...object] : isPlainObject(object) ? merge({}, object, seen) : object;
    }
  };
  const merge = (target, source, seen) => {
    if (!source || typeof source !== 'object') {
      return target;
    }
    if (seen.has(source)) {
      return seen.get(source);
    }
    seen.set(source, target);
    Object.entries(source).forEach(([key, sourceValue]) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }
      const targetValue = target[key];
      target[key] = isPlainObject(sourceValue) && isPlainObject(targetValue) ? merge(targetValue, sourceValue, seen) : structuredCloneSafe(sourceValue, seen);
    });
    return target;
  };
  const seen = new WeakMap();
  sources.forEach((source) => merge(target, source, seen));
  return target;
}
