import { Entity, Column } from 'typeorm';
import { Base,BaseCollectEnum } from './base.entity';
import { ObjectId } from 'mongodb';

export interface DeveloperConfirm {
  startDate: string;
  inputRatio: number;
}

@Entity(BaseCollectEnum.task)
export class Task extends Base {
  @Column()
  projectId: ObjectId;
  @Column()
  taskName: string;

  @Column()
  taskType: 'feature' | 'bug' | 'hotfix' | 'other';

  @Column()
  jiraAddress: string;

  @Column()
  prdAddress: string;

  @Column()
  frontEndDevelopsIds: ObjectId[];

  @Column()
  backEndDevelopsIds: ObjectId[];

  @Column()
  expectLaunchTime: string;

  @Column()
  developerMap: { [key: string]: DeveloperConfirm };

  constructor(option?: Omit<Task, 'id'>) {
    super();
    this.developerMap = {};
    Object.keys(option || {}).forEach(key => {
      this[key] = option[key];
    });
  }
}