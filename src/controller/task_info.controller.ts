import { Body, Controller, Post, Inject, Query, Get, } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { TaskInfoService } from '../service/task_info.service';
import { TaskInfo } from '../entity/task_info.entity';

@Controller('/taskInfo')
export class TaskInfoController {
  @Inject()
  taskInfoService: TaskInfoService;

  @Inject()
  ctx: Context;

  // 创建任务详情
  @Post('/createTaskInfo')
  async createTaskInfo(@Body() body: TaskInfo) {
    return this.taskInfoService.createTaskInfo(body)
  }

  // 更新任务详情
  @Post('/updateTaskInfoById')
  async updateTaskInfoById(@Body() body: TaskInfo
    
  ) {
    return this.taskInfoService.updateTaskInfoById(body)
  }

  // 获取任务明细列表
  @Get('/getTaskDetailList')
  async getTaskDetailList(@Query('taskId') taskId: string) {
    return this.taskInfoService.getTaskDetailList(taskId)
  }

  // 任务的状态改变
  @Post('/updateTaskInfoStatus')
  async updateTaskInfoStatus(@Body() body: {
    id: string
    status: string
  }) {
    return this.taskInfoService.updateTaskInfoStatus(body)
  }
}
