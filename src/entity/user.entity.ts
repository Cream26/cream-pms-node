import { Column, Entity, BeforeInsert } from 'typeorm'
import { Base, BaseCollectEnum } from './base.entity'
import { ObjectId } from 'mongodb' 

export enum UserRoleEnum {
  ADMIN = 'admin',
  USER = 'user'
}
// 1表示正常，0表示禁用
export enum UserStatusEnum {
  NORMAL = 1,
  DISABLE = 0
}

@Entity(BaseCollectEnum.user)
export class User extends Base {
  @Column()
  name: string;

  @Column()
  account: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  departId: ObjectId | null;

  @Column()
  status: UserStatusEnum;

  
  // 角色
  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER
  })
  role: UserRoleEnum;

    // 添加这个钩子方法来确保创建用户时设置默认角色
    @BeforeInsert()
    setDefaultRole() {
      if (!this.role) {
        this.role = UserRoleEnum.USER;
      }
    }
}
