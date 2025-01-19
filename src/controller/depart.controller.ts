import { Body, Controller,Post,Inject,Get,Query } from '@midwayjs/core';
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
  @Get('/getDepartTreeById')
  async getDepartTreeById(@Query('id') departId: string) {
    return this.departService.getDepartTreeById(departId);
  }

  // 更新部门信息
  @Post('/updateDepart')
  async updateDepart(@Body() body: any) {
    return this.departService.updateDepart(body);
  }

  // 调整部门关系
  @Post('/adjustDepartment')
  async adjustDepartment(@Body() body: any) {
    return this.departService.adjustDepartment(body);
  }

  // 删除部门
  @Get('/deleteDepart')
  async deleteDepart(@Query('departId') departId: string) {
    return this.departService.deleteDepart(departId);
  }
}
