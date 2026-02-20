import {
  ClassTransformOptions,
  ExposeOptions,
  plainToInstance,
  Transform,
} from 'class-transformer';
import { Document, isObjectIdOrHexString } from 'mongoose';
import { Type } from '@nestjs/common';

export function TransformIfObject(type: Type, options?: ExposeOptions) {
  const transformToInstance = (
    type: Type,
    input: any,
    options?: ClassTransformOptions,
  ) => {
    if (isObjectIdOrHexString(input)) {
      return input.toString();
    }

    if (input instanceof Document) {
      return plainToInstance(type, input.toJSON(), options);
    }

    return plainToInstance(type, input, options);
  };

  return (target: any, propertyKey: string) => {
    Transform((params) => {
      const classTransformOptions: ClassTransformOptions = {
        enableCircularCheck: true,
      };

      if (Array.isArray(params.obj[propertyKey])) {
        return params.obj[propertyKey].map((i) =>
          transformToInstance(type, i, classTransformOptions),
        );
      }

      return transformToInstance(
        type,
        params.obj[propertyKey],
        classTransformOptions,
      );
    }, options)(target, propertyKey);
  };
}
