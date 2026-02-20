import { UseInterceptors, Type } from '@nestjs/common';

import { ResponseSerializerInterceptor } from '../interceptors/response-serializer.interceptor';
import { ClassTransformOptions } from 'class-transformer';

export function SerializeResponse(dto: Type, options?: ClassTransformOptions) {
  return UseInterceptors(ResponseSerializerInterceptor(dto, options));
}
