type UnionToIntersection<U> = (U extends unknown ? (_: U) => unknown : never) extends (_: infer I) => unknown ? I : never;

export function assignObjectDeep<T extends object, U extends object[]>(target: T, ...sources: U): T & UnionToIntersection<U[number]> {
  const isPlainObject = (object: unknown): object is Record<string, any> => Object.prototype.toString.call(object) === '[object Object]';
  const structuredCloneSafe = <T>(object: T): T => {
    try {
      return structuredClone(object);
    } catch {
      return Array.isArray(object) ? ([...object] as T) : isPlainObject(object) ? (assignObjectDeep({}, object) as T) : object;
    }
  };
  sources.forEach((source) => {
    if (!source || typeof source !== 'object') {
      return;
    }
    Object.entries(source).forEach(([key, sourceValue]) => {
      const targetValue = target[key as keyof T];
      target[key as keyof T] = isPlainObject(sourceValue) && isPlainObject(targetValue) ? assignObjectDeep(targetValue, sourceValue) : structuredCloneSafe(sourceValue);
    });
  });
  return target as T & UnionToIntersection<U[number]>;
}
