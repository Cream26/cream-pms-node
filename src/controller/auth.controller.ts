import { Controller, Post, Inject, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { LoginDTO } from '../interface';
import { AuthService } from '../service/auth.service';

@Controller('/auth')
export class AuthController {
    
  @Inject()
  ctx: Context;

  @Inject()
  AuthService: AuthService;

  @Post('/login')
  async login(@Body() body: LoginDTO) {
    return this.AuthService.login(body)
  }

  @Post('/logout')
  async logout() {
    return this.AuthService.logout()
  }
}
