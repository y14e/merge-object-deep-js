export function mergeObjectDeep(target, ...sources) {
  const cache = new WeakMap();
  for (const source of sources) {
    if (isPlainObject(source)) {
      merge(target, source, cache);
    }
  }
  return target;
}

function getCache(cache, key) {
  const value = cache.get(key);
  if (!value) throw new Error('Cache key missing');
  return value;
}

const objectProto = Object.prototype;

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === objectProto;
}

function merge(target, source, cache) {
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
        const clone = {};
        cache.set(sourceValue, clone);
        merge(clone, sourceValue, cache);
        target[key] = clone;
      }
      continue;
    }
    target[key] = structuredCloneSafe(sourceValue);
  }
}

function structuredCloneSafe(value) {
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
      const result = {};
      for (const key of Object.keys(value)) {
        result[key] = value[key];
      }
      return result;
    }
    return value;
  }
}
