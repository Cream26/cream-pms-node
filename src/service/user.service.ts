import { Inject, Provide } from '@midwayjs/core';
import { User, UserStatusEnum } from '../entity/user.entity';
import { MongoRepository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { ObjectId } from 'mongodb';
// import { mapObjectId } from '../utils/mongodbHelp';
import { DepartService } from './depart.service';
import { Depart } from '../entity/depart.entity';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: MongoRepository<User>;

  @InjectEntityModel(Depart)
  departModel: MongoRepository<Depart>;

  @Inject()
  departService: DepartService;

  @Inject()
  ctx: Context;

  // 创建用户
  async createUser(createUserDTO: {
    name: string;
    account: string;
    password: string;
    phone: string;
    email: string;
    departId: ObjectId;
    status: UserStatusEnum;
  }) {
    // 目前还需要检验唯一字段

    const user = new User();
    Object.assign(user, createUserDTO);
    return await this.userModel.save(user);
  }

  // 获取用户
  async getUserList({
    page,
    pageSize,
    departId,
    search,
  }: {
    page: number;
    pageSize: number;
    departId?: string;
    search?: string;
  }) {
    // 先打印所有用户数据，看看departId的格式
    const allUsers = await this.userModel.find();
    console.log('All users:', allUsers.map(user => ({
      name: user.name,
      departId: user.departId,
      departIdType: typeof user.departId
    })));

    // 构建查询条件
    const where: any = {};
    
    if (departId?.trim()) {
      const allDepartIds = [];
      const departList = await this.departService.getDepartTreeById(departId);
      this.departService.getDepartIdsByDepartTree(departList, allDepartIds);
      
      // 修改查询条件，尝试不同的格式
      where.$or = [
        { departId: { $in: allDepartIds.map(id => new ObjectId(id)) } },
        { departId: { $in: allDepartIds } }
      ];
    }
    
    if (search?.trim()) {
      where.$or = [
        { name: { $regex: search, $options: 'i' } },
        { account: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Query condition:', where);

    const total = await this.userModel.count(where);
    const users = await this.userModel.find({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        password: false
      }
    });

    // 获取所有部门
    const departs = await this.departModel.find();
    const departMap = departs.reduce((map, depart) => {
      map[depart.id.toString()] = depart;
      return map;
    }, {});

    const list = users.map(user => ({
      ...user,
      id: user.id.toString(),
      departId: user.departId?.toString(),
      depart: user.departId ? departMap[user.departId.toString()] || null : null
    }));

    return { list, total };
  }

  // 改变状态
  async updateUserStatus(body: {
    id: string;
    status: UserStatusEnum;
  }){
    console.log('body',body)
    const user = await this.userModel.findOne({
      where: {
        _id: new ObjectId(body.id)
      }
    })
    if (!user) {
      throw new Error('用户不存在');
    }
    user.status = body.status;
    return await this.userModel.save(user);
  }

  // 删除用户
  async deleteUser(id: string) {
    const user = await this.userModel.findOne({
      where: {
        _id: new ObjectId(id)
      }
    })
    if (!user) {
      throw new Error('用户不存在');
    }
    return await this.userModel.delete({ id: new ObjectId(id) });
  }
  // 更新用户信息
  async updateUser(user: Omit<User, 'password'>) {
    // 1. 检查用户是否存在
    const userInfo = await this.userModel.findOne({
      where: {
        _id: new ObjectId(user.id)
      }
    });

    if (!userInfo) {
      throw new Error('用户不存在');
    }

    // 2. 准备更新数据（排除不应该更新的字段）
    const updateData = { ...user };
    delete updateData['id'];
    delete updateData['password'];
    
    // 3. 使用 updateOne 更新用户信息
    return await this.userModel.updateOne(
      { _id: new ObjectId(user.id) },
      { $set: updateData }
    );

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


