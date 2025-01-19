import { Inject, Provide } from '@midwayjs/core';
import { Depart, DepartTree } from '../entity/depart.entity';
import { User } from '../entity/user.entity';
import { MongoRepository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { ObjectId } from 'mongodb';

@Provide()
export class DepartService {
  @InjectEntityModel(Depart)
  departModel: MongoRepository<Depart>;

  @InjectEntityModel(User)
  userModel: MongoRepository<User>;

  @Inject()
  ctx: Context;


  //获取所有的部门
  async getAllDepart() {
    return await this.departModel.find();
  }


  // 获取部门树
  async getDepartTreeById(departId?: string) {
    // 获取所有部门数据
    const departs = await this.getAllDepart();
    // 构建部门 Map
    const departMap = this.buildDepartMap(departs);

    // 如果没有指定 departId，返回完整的部门树
    if (!departId) {
      return this.buildDepartTree(departMap);
    }
    // 如果指定了 departId，查找该部门
    const targetDepart = departMap.get(new ObjectId(departId));
    if (!targetDepart) {
      throw new Error('部门不存在');
    }
    // 使用 formatDepart 构建指定部门的子树
    return [this.formatDepart(targetDepart, departMap)];
  }

  // 根据type添加上下级部门
  async addDepartByType(data: {
    currentDepartId: string;
    type: 'up' | 'down';
    addDepart: {
      name: string;
      description?: string;
    }
  }) {
    // 根部门下
    if (!data.currentDepartId) {
      const depart = new Depart({
        parentId: null,
        name: data.addDepart.name,
        description: data.addDepart.description,
      })
      return await this.departModel.save(depart);
    }
    // 添加下级部门或者上级部门
    if (data.type === 'down') {
      const depart = new Depart({
        parentId: new ObjectId(data.currentDepartId),
        name: data.addDepart.name,
        description: data.addDepart.description,
      })
      return await this.departModel.save(depart);
    } else if (data.type === 'up') {
      //先去查询当前部门是否存在
      const currentDepart = await this.departModel.findOneBy({
        _id: new ObjectId(data.currentDepartId),
      });
      // 如果当前部门存在，并且有上级部门
      if (currentDepart.parentId) {
        const upDepart = new Depart({
          name: data.addDepart.name,
          description: data.addDepart.description,
          parentId: currentDepart.parentId,
        })
        const { id } = await this.departModel.save(upDepart);
        // 更新当前部门的上级部门
        await this.departModel.findOneAndUpdate({
          _id: new ObjectId(data.currentDepartId),
        }, {
          $set: { parentId: id }
        })
      }
    }
  }

  // 更新部门信息
  async updateDepart(data: {
    id: string;
    name: string;
    description: string;
  }) {
    return await this.departModel.updateOne({
      _id: new ObjectId(data.id),
    }, {
      $set: { name: data.name, description: data.description }
    })
  }

  // 调整部门关系
  async adjustDepartment(data: {
    departId: string;
    parentId: string | null;
  }) {
    const newParentId = data.parentId?.trim() ? new ObjectId(data.parentId) : null;
    return await this.departModel.updateOne({
      _id: new ObjectId(data.departId),
    }, {
      $set: { parentId: newParentId }
    })
  }

  // 删除部门
  async deleteDepart(departId: string) {
    const hasChildDeparts = await this.departModel.findOne({
      where: { parentId: new ObjectId(departId) },
    });
    if (hasChildDeparts) {
      throw new Error('该部门下有子部门，无法删除');
    }
    // 检查部门下是否有人员
    const hasUsers = await this.userModel.findOne({
      where: { departId: new ObjectId(departId) }
    });
    if (hasUsers) {
      throw new Error('该部门下存在人员，无法删除');
    }
    return await this.departModel.deleteOne({
      _id: new ObjectId(departId),
    })
  }

  // 构建部门树(将所有部门数据按照父子关系整理)
  buildDepartTree(departMap: Map<ObjectId, Depart>): DepartTree[] {
    const result: DepartTree[] = [];

    // 遍历部门Map，找出根部门（parentId 为 null 的部门）
    departMap.forEach((depart) => {
      if (!depart.parentId) {
        // 根部门没有父级，直接作为树根节点
        const formattedDepart = this.formatDepart(depart, departMap);
        result.push(formattedDepart);
      }
    });

    return result;
  }

  // 格式化部门数据
  formatDepart(depart: Depart, departMap: Map<ObjectId, Depart>): DepartTree {
    const formattedDepart: DepartTree = {
      ...depart,
      key: depart.id.toString(),
      id: depart.id,
      children: this.getChildren(depart.id, departMap),
    };
    return formattedDepart;
  }

  // 获取子部门
  getChildren(parentId: ObjectId, departMap: Map<ObjectId, Depart>) {
    const children: Depart[] = [];
    departMap.forEach((depart) => {
      if (depart.parentId && depart.parentId.toString() === parentId.toString()) {
        // 当前部门的 parentId 等于传入的 parentId，表示是其子部门
        const formattedChild = this.formatDepart(depart, departMap);
        children.push(formattedChild);
      }
    });
    return children;
  }
  // 将部门数组转换为Map,以便查找
  buildDepartMap(departs: Depart[]) {
    const departMap = new Map<ObjectId, Depart>();
    departs.forEach((depart) => {
      departMap.set(depart.id, depart);
    })
    return departMap;
  }
}

