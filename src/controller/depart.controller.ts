import { Body, Controller,Post,Inject,Get } from '@midwayjs/core';
import { DepartService } from '../service/depart.service';
// import { Depart } from '../entity/depart.entity';
import { Context } from '@midwayjs/koa';

@Controller('/depart')
export class DepartController {
  @Inject()
  ctx: Context;

  @Inject()
  departService: DepartService;

  // 根据type添加上下级部门
  @Post('/addDepartByType')
  async addDepartByType(@Body() body: any) {
    return this.departService.addDepartByType(body);
  }

  // 获取部门树
  @Get('/getDepartTree')
  async getDepartTree() {
    return this.departService.getDepartTree();
  }

  // 更新部门信息
  @Post('/updateDepart')
  async updateDepart(@Body() body: any) {
    return this.departService.updateDepart(body);
  }
}
