import { Type } from '@nestjs/common';

export interface CreateErrorOptions {
  error: Type<Error>;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function createError(options: CreateErrorOptions): never {
  const { error, code, message, details } = options;
  const body = {
    message,
    errCode: code,
    ...(details && { details }),
  };
  throw new (error as any)(body);
}
