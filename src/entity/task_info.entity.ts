import { Entity, Column } from 'typeorm';
import { Base,BaseCollectEnum } from './base.entity';
import { ObjectId } from 'mongodb';

@Entity(BaseCollectEnum.taskInfo)
export class TaskInfo extends Base {
  @Column()
  taskId: ObjectId;

  @Column()
  name: string;

  @Column()
  desc: string;

  @Column()
  time: number;

  @Column()
  implementer: ObjectId;

  @Column()
  status: 'todo' | 'doing' | 'done';

  @Column({ default: false })
  confirmed: boolean;

  constructor(option?: Omit<TaskInfo, 'id'>) {
    super();
    Object.keys(option || {}).forEach(key => {
      this[key] = option[key];
    });
  }
}