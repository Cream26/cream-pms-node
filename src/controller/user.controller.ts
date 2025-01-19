import { Body, Controller,Post,Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';
import { User } from '../entity/user.entity';
import { Context } from '@midwayjs/koa';

@Controller('/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Post('/create')
  async create(@Body() body: User) {
    console.log('UserService:', this.userService);
    return this.userService.createUser(body);
  }

  @Post('/info')
  async info() {
    const userId = this.ctx.userId;
    console.log(userId, 'userId')
    if(!userId) {
      throw new Error('未登录');
    }
    return this.userService.findById(userId);
  }
}
