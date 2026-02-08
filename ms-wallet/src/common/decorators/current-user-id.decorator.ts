import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequestWithUser } from '../guards/auth.guard';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequestWithUser>();

    return request.user?.sub;
  },
);
