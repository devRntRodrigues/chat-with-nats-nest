import { ExposeOptions, Transform } from 'class-transformer';
import { isObjectIdOrHexString } from 'mongoose';

export function TransformMongoId(options?: ExposeOptions) {
  return (target: any, propertyKey: string) => {
    Transform((params) => {
      if (
        params.obj[propertyKey] &&
        isObjectIdOrHexString(params.obj[propertyKey])
      ) {
        return params.obj[propertyKey]?.toString();
      }

      return params.obj[propertyKey];
    }, options)(target, propertyKey);
  };
}
