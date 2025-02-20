import { Entity, Column } from 'typeorm';
import { Base,BaseCollectEnum } from './base.entity';
import { ObjectId } from 'mongodb';

export interface CodeStoreDetail {
  uid: string;
  name: string;
  storeAddress: string;
  mainBranch: string;
  nodeVersion: number;
  jenkinsUrl?: string;
  remark?: string;
}

@Entity(BaseCollectEnum.project)
export class Project extends Base {
  @Column()
  name: string;

  // 部门id
  @Column()
  departId: ObjectId;

  // 项目PM
  @Column()
  projectPMId: ObjectId;

  @Column()
  frontendLeadId: ObjectId;

  @Column()
  backendLeadId: ObjectId;

  @Column()
  ownerId: ObjectId;

  // 环境
  @Column()
  env: string;

  @Column({type: 'array',default:[]})
  codeStoreList: CodeStoreDetail[];

  constructor(option?: Omit<Project, 'id'>) {
    super();
    this.codeStoreList = []
    Object.keys(option || {}).forEach(key => {
      this[key] = option[key];
    });
  }
}