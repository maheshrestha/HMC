import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '../dto/current-user.dto';

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof CurrentUser | undefined,
    ctx: ExecutionContext,
  ): CurrentUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUser;

    return (data ? user?.[data] : user) as CurrentUser | string | undefined;
  },
);
