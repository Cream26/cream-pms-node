import { Column, Entity } from 'typeorm'
import { Base, BaseCollectEnum } from './base.entity'
import { ObjectId } from 'mongodb'

@Entity(BaseCollectEnum.depart)
export class Depart extends Base {

  @Column()
  parentId: ObjectId | null;

  @Column()
  name: string;

  @Column()
  description: string;

  constructor(options?: Omit<Depart, 'id'>){
    super()
    Object.keys(options || {}).forEach(key => {
      this[key] = options[key]
    })
  }
}

export class DepartTree extends Depart {
  children?: DepartTree[]
  key?: string
}
