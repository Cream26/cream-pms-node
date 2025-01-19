import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

// 格式化返回数据中间件
@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();
      console.log(result, 'result')
      if(result === null) {
        ctx.status = 200;
      }

      return {
        success: true,
        data: result,
        message: 'OK',
        code: 200,
      }
    }
  }

  static getName(): string {
    return 'format';
  }
}