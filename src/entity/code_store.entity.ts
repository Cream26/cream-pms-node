import { Column, Entity } from 'typeorm'
import { Base, BaseCollectEnum } from './base.entity'

@Entity(BaseCollectEnum.codeStore)
export class CodeStore extends Base {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  type: string;
  
  @Column()
  address: string;

  @Column()
  owner: string;
}

