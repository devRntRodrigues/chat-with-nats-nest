import {
  ClassSerializerInterceptor,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Document } from 'mongoose';
import { ClassSerializerContextOptions } from '@nestjs/common/serializer/class-serializer.interfaces';
import { ClassSerializerInterceptorOptions } from '@nestjs/common/serializer/class-serializer.interceptor';

export function ResponseSerializerInterceptor(
  classToIntercept: Type,
  options?: ClassTransformOptions,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    constructor(
      reflector: any,
      defaultOptions?: ClassSerializerInterceptorOptions,
    ) {
      super(reflector, {
        ...defaultOptions,
        ...options,
        excludeExtraneousValues: true,
      });
    }

    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassSerializerContextOptions,
    ) {
      let data: any = response;

      if (response instanceof Document) {
        data = response.toJSON();
      }

      return plainToInstance(classToIntercept, data, options);
    }
  };
}
