import { Body, Controller, Post, Inject, Get, Query } from '@midwayjs/core';
import { UserService } from '../service/user.service';
import { User } from '../entity/user.entity';
import { Context } from '@midwayjs/koa';

@Controller('/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Post('/createUser')
  async createUser(@Body() body: User) {
    console.log('UserService:', this.userService);
    return this.userService.createUser(body);
  }

  @Post('/info')
  async info() {
    const userId = this.ctx.userId;
    console.log(userId, 'userId')
    if (!userId) {
      throw new Error('未登录');
    }
    return this.userService.findById(userId);
  }

  // 根据部门获取人员
  @Get('/getUserList')
  async getUserList(@Query() query: {
    page: number;
    pageSize: number;
    departId: string;
    search: string;
  }) {
    return this.userService.getUserList({
      page: Number(query.page),
      pageSize: Number(query.pageSize),
      departId: query.departId,
      search: query.search,
    });
  }

  // 改变状态
  @Post('/updateUserStatus')
  async updateUserStatus(@Body() body: {
    id: string;
    status: number;
  }) {
    return this.userService.updateUserStatus({ id: body.id, status: body.status });
  }

  // 删除人员
  @Post('/deleteUser')
  async deleteUser(@Body() body: {id: string}) {
    return this.userService.deleteUser(body.id);
  }

  // 更新用户
  @Post('/updateUser')
  async updateUser(@Body() body: Omit<User, 'password'>) {
    return this.userService.updateUser(body);
  }

  // 获取所有用户
  @Get('/getAllUser')
  async getAllUser() {
    return this.userService.getAllUser()
  }
}
