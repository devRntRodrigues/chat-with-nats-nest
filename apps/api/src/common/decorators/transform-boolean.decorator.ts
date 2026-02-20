import { ExposeOptions, Transform } from 'class-transformer';

export function TransformBoolean(options?: ExposeOptions) {
  return (target: any, propertyKey: string) => {
    Transform((params) => {
      const value = params.obj[propertyKey]?.toString();
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value;
    }, options)(target, propertyKey);
  };
}
