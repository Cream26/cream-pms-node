import { Body, Controller, Post, Inject, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { TaskService } from '../service/task.service';

@Controller('/task')
export class TaskController {
  @Inject()
  ctx: Context;

  @Inject()
  taskService: TaskService;

  // 创建任务
  @Post('/createTask')
  async createTask(@Body() body: {
    projectId: string;
    taskName: string;
    taskType: 'feature' | 'bug' | 'hotfix' | 'other';
    jiraAddress: string;
    prdAddress: string;
    frontEndDevelopsIds: string[];
    backEndDevelopsIds: string[];
    expectLaunchTime: string;
  }) {
    return this.taskService.createTask(body)
  }

  // 获取任务列表
  @Get('/getTaskList')
  async getTaskList(@Query('projectId') projectId: string) {
    return this.taskService.getTaskList(projectId)
  }

  @Post('/updateTaskById')
  async updateTaskById(@Body() body: {
    id: string;
    taskName?: string;
    taskType?: 'feature' | 'bug' | 'hotfix' | 'other';
    jiraAddress?: string;
    prdAddress?: string;
    frontEndDevelopsIds?: string[];
    backEndDevelopsIds?: string[];
    expectLaunchTime?: string;
  }) {
    return this.taskService.updateTaskById(body);
  }

  @Get('/deleteTaskById')
  async deleteTaskById(@Query('id') id: string) {
    return this.taskService.deleteTaskById(id);
  }

  @Get('/getTaskInfoById')
  async getTaskInfoById(@Query('taskId') taskId: string) {
    return this.taskService.getTaskInfoById(taskId);
  }

  // PM确认
  @Get('/pmConfirmed')
  async pmConfirmed(@Query('taskId') taskId: string) {
    return this.taskService.pmConfirmed(taskId);
  }

  // 开发确认
  @Post('/devConfirmed')
  async devConfirmed(@Body() body: {
    taskId: string,
    inputRatio: number
    startDate: string
  }) {
    return this.taskService.devConfirmed(body);
  }
}