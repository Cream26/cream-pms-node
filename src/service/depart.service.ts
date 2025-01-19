import { Inject, Provide } from '@midwayjs/core';
import { Depart, DepartTree } from '../entity/depart.entity';
// import { DepartTree } from '../entity/depart.entity';
import { MongoRepository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { ObjectId } from 'mongodb';

@Provide()
export class DepartService {
  @InjectEntityModel(Depart)
  departModel: MongoRepository<Depart>;

  @Inject()
  ctx: Context;


  //获取所有的部门
  async getAllDepart() {
    return await this.departModel.find();
  }


  // 获取部门树
  async getDepartTree() {
    const departs = await this.getAllDepart();
    const departMap = this.buildDepartMap(departs);
    const tree = this.buildDepartTree(departMap);
    return tree;
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

