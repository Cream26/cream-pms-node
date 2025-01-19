import { Middleware, IMiddleware, httpError, Inject } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {

  @Inject()
  jwtService: JwtService;

  private readonly AUTH_HEADER = 'authorization';
  private readonly BEARER_SCHEME = 'Bearer';

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const authHeader = ctx.get(this.AUTH_HEADER).trim();

      if (!authHeader) {
        throw new httpError.UnauthorizedError('Authorization header missing');
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== this.BEARER_SCHEME) {
        throw new httpError.UnauthorizedError('Invalid authorization header format');
      }

      const token = parts[1];
      try {
        const result = await this.jwtService.verify(token, { complete: true }) as any;
        ctx.userId = result?.payload?.id;
        console.log(ctx.userId, 'ctx.userId')
        if (!result) {
          throw new httpError.UnauthorizedError('Invalid token');
        }
      } catch (error) {
        throw new httpError.UnauthorizedError(`Token verification failed: ${error.message}`);
      }

      await next();
    };
  }

  // 忽略鉴权的路径
  ignore(ctx: Context): boolean {
    return [
      '/auth/login'
    ].some(url => ctx.path.includes(url));
  }

  static getName(): string {
    return 'auth';
  }
}
