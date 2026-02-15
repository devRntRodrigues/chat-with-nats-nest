import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@/config/passport';

export const User = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | undefined | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
