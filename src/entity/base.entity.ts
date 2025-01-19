import {
  Column,
  CreateDateColumn,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ObjectId as MongoObjectId } from 'mongodb';

export class Base {
  @ObjectIdColumn()
  id: MongoObjectId;

  @CreateDateColumn()
  createdAt?: Date;

  // 更新时间字段
  @UpdateDateColumn()
  updatedAt?: Date;

  @Column()
  createBy?: MongoObjectId;

  @Column()
  updateBy?: MongoObjectId;
}

export enum BaseCollectEnum {
  user = 'user',
  codeStore = 'codeStore',
  depart = 'depart',
}