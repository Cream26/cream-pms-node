import { Middleware, IMiddleware, httpError, Inject } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { TokenService } from '../service/token.service';
import { JwtService } from '@midwayjs/jwt';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  tokenService: TokenService;

  @Inject()
  jwtService: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const authHeader = ctx.get('Authorization').trim();

      if (!authHeader) {
        throw new httpError.UnauthorizedError('Authorization header missing');
      }

      const [scheme, token] = authHeader.split(' ');
      if (scheme !== 'Bearer' || !token) {
        throw new httpError.UnauthorizedError('Invalid authorization header format');
      }

      try {
        const refreshToken = ctx.cookies.get('refresh_token');
        const decoded = await this.jwtService.decode(refreshToken) as any;
        ctx.userId = decoded.payload.id;
        ctx.userRole = decoded.payload.role;
        ctx.userAccount = decoded.payload.account;
        await this.tokenService.verifyAccessToken(token);
        // // 将用户信息添加到上下文中
        // ctx.userId = payload.id;
        // ctx.userRole = payload.role;
        // ctx.userAccount = payload.account;
      } catch (error) {
        throw new httpError.UnauthorizedError(`Token verification failed: ${error.message}`);
      }

      await next();
    };
  }

  // 忽略鉴权的路径
  ignore(ctx: Context): boolean {
    return [
      '/auth/login',
      '/auth/refresh',
    ].some(url => ctx.path.includes(url));
  }

  static getName(): string {
    return 'auth';
  }
}
