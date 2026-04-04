export function mergeObjectDeep(target, ...sources) {
  const cache = new WeakMap();
  sources.forEach((source) => merge(target, source, cache));
  return target;
}

function merge(target, source, cache) {
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

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function structuredCloneSafe(value, cache) {
  try {
    return structuredClone(value);
  } catch {
    if (Array.isArray(value)) {
      const result = new Array(value.length);
      value.forEach((item, i) => {
        result[i] = item;
      });
      return result;
    }
    if (isPlainObject(value)) {
      return merge({}, value, cache);
    }
    return value;
  }
}
