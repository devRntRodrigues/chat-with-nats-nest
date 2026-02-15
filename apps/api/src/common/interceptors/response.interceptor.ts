import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: unknown;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((value) => {
        if (value && typeof value === 'object' && 'data' in value) {
          const { data, meta } = value as { data: T; meta?: unknown };
          const response: ApiResponse<T> = { data };
          if (meta !== undefined) {
            response.meta = meta;
          }
          return response;
        }
        return { data: value } as ApiResponse<T>;
      }),
    );
  }
}
