import { Controller, Post, Inject, Body, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { LoginDTO } from '../interface';
import { AuthService } from '../service/auth.service';
import { TokenService } from '../service/token.service';
import { JwtService } from '@midwayjs/jwt';

interface Decode {
  header: any;
  payload: any;

}
@Controller('/auth')
export class AuthController {
  @Inject()
  authService: AuthService;

  @Inject()
  tokenService: TokenService;

  @Inject()
  ctx: Context;

  @Inject()
  jwtService: JwtService;

  @Post('/login')
  async login(@Body() loginDto: LoginDTO) {
    return await this.authService.login(loginDto);
  }

  @Get('/refresh')
  async refresh() {
    const refreshToken = this.ctx.cookies.get('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }
    const decoded = await this.jwtService.decode(refreshToken) as Decode;
    const userId = decoded.payload.id;
    const newAccessToken = await this.tokenService.verifyRefreshToken(userId, refreshToken);

    return {
      token: newAccessToken
    };
  }

  @Post('/logout')
  async logout() {
    return await this.authService.logout();
  }
}
