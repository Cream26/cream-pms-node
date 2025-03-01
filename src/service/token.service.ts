import { Provide, Config, Inject,Scope,ScopeEnum } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { RedisService } from '@midwayjs/redis';
import { Context } from '@midwayjs/koa';

// Token 相关的类型定义
export interface TokenPayload {
  id: string;
  account: string;
  role: string;
  type: 'accessToken' | 'refreshToken';
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class TokenService {

  @Config('jwt')
  jwtConfig: any;

  @Inject()
  redisService: RedisService;
  @Inject()
  jwtService: JwtService;

  @Inject()
  ctx: Context;


  // 生成令牌对
  async generateTokens(payload: { id: string; account: string; role: string }) {
    // 生成访问令牌
    const accessToken = await this.jwtService.sign({
      ...payload,
      type: 'accessToken',
    } as TokenPayload, this.jwtConfig.accessToken.secret, {
      expiresIn: this.jwtConfig.accessToken.expiresIn
    });

    // 生成刷新令牌
    const refreshToken = await this.jwtService.sign({
      ...payload,
      type: 'refreshToken',
    } as TokenPayload, this.jwtConfig.refreshToken.secret, {
      expiresIn: this.jwtConfig.refreshToken.expiresIn
    });
    const redisKey = `refreshToken:${payload.id}`;

    // 将刷新令牌存储在Redis中
    await this.redisService.set(
      redisKey, 
      refreshToken, 
      'EX', 
      this.parseTimeToSeconds(this.jwtConfig.refreshToken.expiresIn)
    );
    const storedToken = await this.redisService.get(redisKey);
    console.log('Verified stored token:', {
      key: redisKey,
      exists: !!storedToken,
      matches: storedToken === refreshToken
    });

    return {
      accessToken,
      refreshToken
    };
  }

  // 辅助方法：将时间字符串转换为秒数
  private parseTimeToSeconds(time: string): number {
    const units = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };
    
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60; // 默认7天
    }
    
    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  // 验证访问令牌
  async verifyAccessToken(accessToken: string): Promise<TokenPayload> {
    try {
      const decodedToken = await this.jwtService.verify(
        accessToken, 
        this.jwtConfig.accessToken.secret
      );
      return decodedToken as unknown as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // 验证刷新令牌并生成新的访问令牌
  async verifyRefreshToken(userId: string, refreshToken: string) {
    try {
      // 验证 refresh token
      await this.jwtService.verify(refreshToken, this.jwtConfig.refreshToken.secret);
      
      // 检查redis里面是否有效
      const storedToken = await this.redisService.get(`refreshToken:${userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // 解码 token 获取用户信息
      const decodedToken = await this.jwtService.decode(refreshToken) as TokenPayload;
      
      // 生成新的访问令牌
      const newAccessToken = await this.jwtService.sign({
        id: decodedToken.id,
        account: decodedToken.account,
        role: decodedToken.role,
        type: 'accessToken',
      }, this.jwtConfig.accessToken.secret, {
        expiresIn: this.jwtConfig.accessToken.expiresIn
      });

      return newAccessToken;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // 使令牌失效（登出）
  async logout(userId: string) {
    // 删除 Redis 中存储的刷新令牌
    await this.redisService.del(`refreshToken:${userId}`);
  }
}
