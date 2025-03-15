import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserType } from '@prisma/client';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: { user: UserType } = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
