import { Provide } from '@midwayjs/core';
import { CodeStore } from '../entity/code_store.entity';
import { MongoRepository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { ObjectId } from 'mongodb';


@Provide()
export class CodeStoreService {
  @InjectEntityModel(CodeStore)
  codeStoreModel: MongoRepository<CodeStore>;

  // 创建代码仓库
  async createCodeStore(createCodeStoreDTO: {
    name: string;
    description: string;
    type: string;
    address: string;
    owner: string;
  }) {
    const codeStore = new CodeStore();
    Object.assign(codeStore, createCodeStoreDTO);
    return await this.codeStoreModel.save(codeStore);
  }

  // 获取代码仓库列表
  async getCodeStoreList() {
    return await this.codeStoreModel.find();
  }

  // 删除代码仓库
  async deleteCodeStore(id: string) {
    const objectId = new ObjectId(id); // 将字符串 id 转换为 ObjectId
    const codeStore = await this.codeStoreModel.findOne({ where: { _id: objectId } });
    if (!codeStore) {
      throw new Error('Record not found');
    }
    try {
      await this.codeStoreModel.remove(codeStore);
      return true
    } catch (error) {
      return false
    }
  }

  // 更新代码仓库
  async updateCodeStore(id: string, updateCodeStoreDTO: {
    name: string;
    description: string;
    type: string;
    address: string;
    owner: string;
  }) {
    const objectId = new ObjectId(id);
    const codeStore = await this.codeStoreModel.findOne({ where: { _id: objectId } });
    if (!codeStore) {
      throw new Error('Record not found');
    }
    Object.assign(codeStore, updateCodeStoreDTO);
    return await this.codeStoreModel.save(codeStore);
  }
}
