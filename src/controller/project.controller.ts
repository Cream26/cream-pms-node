import { Body, Controller, Post, Inject, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ProjectService } from '../service/project.service';

@Controller('/project')
export class ProjectController {
  @Inject()
  ctx: Context;

  @Inject()
  projectService: ProjectService;

  // 创建项目
  @Post('/createProject')
  async createProject(@Body() body: {
    name: string;
    projectPMId: string;
    departId: string;
    frontendLeadId: string;
    backendLeadId: string;
    env: string;
  }) {
    return this.projectService.createProject(body)
  }

  // 更新项目
  @Post('/updateProjectById')
  async updateProjectById(@Body() body: {
    projectId: string;
    name: string;
    projectPMId: string;
    departId: string;
    frontendLeadId: string;
    backendLeadId: string;
    env: string;
  }) {
    return this.projectService.updateProjectById(body)
  }

  // 获取所有项目列表
  @Get('/getAllProject')
  async getAllProject() {
    return this.projectService.getAllProject()
  }

  // 根据id获取项目详情
  @Get('/getProjectDetailById')
  async getProjectDetailById(@Query('projectId') projectId: string) {
    return this.projectService.getProjectDetailById(projectId)
  }

}
