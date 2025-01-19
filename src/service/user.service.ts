import {Inject, Provide } from '@midwayjs/core';
import { User } from '../entity/user.entity';
import { MongoRepository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { ObjectId } from 'mongodb';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: MongoRepository<User>;

  @Inject()
  ctx: Context;

  async createUser(createUserDTO: {
    name: string;
    account: string;
    password: string;
    phone: string;
    email: string;
  }) {
    // 目前还需要检验唯一字段

    const user = new User();
    Object.assign(user, createUserDTO);
    return await this.userModel.save(user);
  }

  // 根据id查询用户
  async findById(id: string) {
    return await this.userModel.findOne({
      where: {
        _id: new ObjectId(id)
      }
    })
  }
}


