type UnionToIntersection<U> = (U extends unknown ? (_: U) => unknown : never) extends (_: infer I) => unknown ? I : never;

export function objectAssignDeep<T extends object, U extends object[]>(target: T, ...sources: U): T & UnionToIntersection<U[number]> {
  const isPlainObject = (value: unknown): value is Record<string, any> => Object.prototype.toString.call(value) === '[object Object]';
  const safeStructuredClone = <T>(value: T): T => {
    try {
      return structuredClone(value);
    } catch {
      return Array.isArray(value) ? ([...value] as T) : isPlainObject(value) ? (objectAssignDeep({}, value) as T) : value;
    }
  };
  sources.forEach((source) => {
    if (!source || typeof source !== 'object') {
      return;
    }
    Object.entries(source).forEach(([key, sourceValue]) => {
      const targetValue = target[key as keyof T];
      target[key as keyof T] = isPlainObject(sourceValue) && isPlainObject(targetValue) ? objectAssignDeep(targetValue, sourceValue) : safeStructuredClone(sourceValue);
    });
  });
  return target as T & UnionToIntersection<U[number]>;
}
