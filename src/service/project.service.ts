import { Context, Inject, Provide } from '@midwayjs/core';
import { Project } from '../entity/project.entity';
import { MongoRepository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { ObjectId } from 'mongodb';
import { UserService } from './user.service';
import { DepartService } from './depart.service';

@Provide()
export class ProjectService {
  @InjectEntityModel(Project)
  projectModel: MongoRepository<Project>;

  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  departService: DepartService;

  // 创建项目
  async createProject(project: {
    name: string;
    projectPMId: string;
    departId: string;
    frontendLeadId: string;
    backendLeadId: string;
    env: string;
  }) {
    const ownerId = (this.ctx as any).userId;
    if (!ownerId) {
      throw new Error("用户已失效，请重新登录")
    }
    const newProject = new Project()

    Object.assign(newProject, {
      ...project,
      ownerId: new ObjectId(ownerId as string),
      projectPMId: new ObjectId(project.projectPMId),
      departId: new ObjectId(project.departId),
      frontendLeadId: new ObjectId(project.frontendLeadId),
      backendLeadId: new ObjectId(project.backendLeadId),
    });
    return await this.projectModel.save(newProject)
  }

  // 更新项目
  async updateProjectById(data: {
    projectId: string;
    name?: string;
    projectPMId?: string;
    departId?: string;
    frontendLeadId?: string;
    backendLeadId?: string;
    env?: string;
  }) {
    const { projectId, ...rest } = data
    // const project = await this.projectModel.findOne({
    //   where: {
    //     _id: new ObjectId(projectId)
    //   }
    // })
    const updateFields = {
      ...rest,
      ...(rest.projectPMId && { projectPMId: new ObjectId(rest.projectPMId) }),
      ...(rest.departId && { departId: new ObjectId(rest.departId) }),
      ...(rest.frontendLeadId && { frontendLeadId: new ObjectId(rest.frontendLeadId) }),
      ...(rest.backendLeadId && { backendLeadId: new ObjectId(rest.backendLeadId) }),
    };
    await this.projectModel.updateOne({ _id: new ObjectId(projectId) }, { $set: updateFields })
  }

  // 获取所有项目列表
  async getAllProject() {
    const projectLists = await this.projectModel.find()
    const projectInfoList = await Promise.all(projectLists.map(async (project) => {
      const [projectPMInfo, frontendLeadInfo, backendLeadInfo, ownerInfo, departInfo] = await Promise.all([
        this.userService.findById(project.projectPMId),
        this.userService.findById(project.frontendLeadId),
        this.userService.findById(project.backendLeadId),
        this.userService.findById(project.ownerId),
        this.departService.findById(project.departId),
      ])
      return {
        ...project,
        projectPMInfo,
        frontendLeadInfo,
        backendLeadInfo,
        ownerInfo,
        departInfo,
      }
    }))
    return projectInfoList
  }

  // 根据id获取项目详情
  async getProjectDetailById(projectId: string) {
    const project = await this.projectModel.findOne({
      where: {
        _id: new ObjectId(projectId)
      }
    });

    if (!project) {
      throw new Error('项目不存在');
    }

    const [projectPMInfo, frontendLeadInfo, backendLeadInfo, ownerInfo, departInfo] = await Promise.all([
      this.userService.findById(project.projectPMId),
      this.userService.findById(project.frontendLeadId),
      this.userService.findById(project.backendLeadId),
      this.userService.findById(project.ownerId),
      this.departService.findById(project.departId),
    ]);

    return {
      ...project,
      projectPMInfo,
      frontendLeadInfo,
      backendLeadInfo,
      ownerInfo,
      departInfo,
    };
  }
}