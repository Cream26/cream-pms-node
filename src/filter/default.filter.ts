import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    // 所有的未分类错误会到这里
    if ((err as any).status === 422) {
      return {
        code: (err as any).status ?? 500,
        success: false,
        message: '请求参数错误' + err.message,
      };
    }
    return {
      code: (err as any).status ?? 500,
      success: false,
      message: err.message,
    };
  }
}
