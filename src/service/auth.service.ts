import { Inject, Provide } from '@midwayjs/core';
import { LoginDTO } from '../interface';
import { JwtService } from '@midwayjs/jwt';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { User, UserStatusEnum } from '../entity/user.entity';
import { MongoRepository } from 'typeorm';
import { TokenService } from './token.service';
import { Context } from '@midwayjs/koa'

@Provide()
export class AuthService {
  @Inject()
  jwtService: JwtService;

  @Inject()
  tokenService: TokenService

  @Inject()
  ctx: Context

  @InjectEntityModel(User)
  userModel: MongoRepository<User>;

  // 登录
  async login(body: LoginDTO) {
    const user = await this.userModel.findOne({
      where: {
        account: body.account,
        password: body.password
      }
    })
    if (!user) {
      throw new Error('用户不存在')
    }
    if (user.password !== body.password) {
      throw new Error('账号或密码错误')
    }
    if (user.status === UserStatusEnum.DISABLE) {
      throw new Error('用户已禁用，请联系管理员')
    }
    const tokens = await this.tokenService.generateTokens({
      id: user.id.toString(),
      account: user.account,
      role: user.role,
    })
    // 设置 refresh token 到 HttpOnly Cookie
    this.ctx.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: '/',
    });
    //   id: user.id,
    //   account: user.account,
    //   role: user.role,
    //   issuer: 'Cream26'
    // })
    const { password, ...userInfo } = user;
    return {
      token: tokens.accessToken,
      userInfo
    }
  }

  // 登出
  async logout() {
    const userId = this.ctx.userId;
    await this.tokenService.logout(userId);
    this.ctx.cookies.set('refresh_token', null, {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    this.ctx.set('Clear-Access-Token', 'true');

    this.ctx.cookies.set('refresh_token', null);
    return '登出成功';
  }
}
