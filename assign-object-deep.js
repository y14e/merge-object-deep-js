export function assignObjectDeep(target, ...sources) {
  const isPlainObject = (object) => Object.prototype.toString.call(object) === '[object Object]';
  const structuredCloneSafe = (object) => {
    try {
      return structuredClone(object);
    } catch {
      return Array.isArray(object) ? [...object] : isPlainObject(object) ? assignObjectDeep({}, object) : object;
    }
  };
  sources.forEach((source) => {
    if (!source || typeof source !== 'object') {
      return;
    }
    Object.entries(source).forEach(([key, sourceValue]) => {
      const targetValue = target[key];
      target[key] = isPlainObject(sourceValue) && isPlainObject(targetValue) ? assignObjectDeep(targetValue, sourceValue) : structuredCloneSafe(sourceValue);
    });
  });
  return target;
}
