import { Inject, Provide } from '@midwayjs/core';
import { LoginDTO } from '../interface';
import { JwtService } from '@midwayjs/jwt';
import {InjectEntityModel} from '@midwayjs/typeorm';
import { User } from '../entity/user.entity';
import { MongoRepository } from 'typeorm';

@Provide()
export class AuthService {
  @Inject()
  jwtService: JwtService;

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
    if(!user) {
      throw new Error('用户不存在')
    }
    if(user.password !== body.password) {
      throw new Error('账号或密码错误')
    }
    const token = await this.jwtService.sign({
      id: user.id,
      account: user.account,
      role: user.role,
      issuer: 'Cream26'
    })
    const {password, ...userInfo} = user;
    return {
      token,
      userInfo
    }
  }

  // 登出
  async logout() {
    return '登出成功'
  }
}
