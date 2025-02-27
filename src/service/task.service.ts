import { Provide, Inject } from "@midwayjs/core";
import { Task } from "../entity/task.entity";
import { MongoRepository } from "typeorm";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Context } from "@midwayjs/koa";
import { ObjectId } from 'mongodb';
import { mapObjectId } from "../utils/mongodbHelp";
import { TaskInfo } from "../entity/task_info.entity";

@Provide()
export class TaskService {
  @InjectEntityModel(Task)
  taskModel: MongoRepository<Task>;

  @InjectEntityModel(TaskInfo)
  taskInfoModel: MongoRepository<TaskInfo>;

  @Inject()
  ctx: Context;

  // 创建任务
  async createTask(task: {
    projectId: string;
    taskName: string;
    taskType: 'feature' | 'bug' | 'hotfix' | 'other';
    jiraAddress: string;
    prdAddress: string;
    frontEndDevelopsIds: string[];
    backEndDevelopsIds: string[];
    expectLaunchTime: string;
  }) {
    const newTask = new Task();
    newTask.projectId = new ObjectId(task.projectId);
    newTask.taskName = task.taskName;
    newTask.taskType = task.taskType;
    newTask.jiraAddress = task.jiraAddress;
    newTask.prdAddress = task.prdAddress;
    newTask.frontEndDevelopsIds = task.frontEndDevelopsIds.map(id => new ObjectId(id));
    newTask.backEndDevelopsIds = task.backEndDevelopsIds.map(id => new ObjectId(id));
    newTask.expectLaunchTime = task.expectLaunchTime;

    return await this.taskModel.save(newTask);
  }

  // 获取任务列表
  async getTaskList(projectId: string) {
    const tasks = await this.taskModel.find({
      where: {
        projectId: new ObjectId(projectId)
      }
    });
    const taskDetails = await Promise.all(tasks.map(async (task) => {
      const taskInfoList = await this.taskInfoModel.find({
        where: {
          taskId: new ObjectId(task.id)
        }
      })
      return {
        ...task,
        taskInfoList
      }
    }
  ))
  return taskDetails;
  }

  // 更新任务
  async updateTaskById(data: {
    id: string;
    taskName?: string;
    taskType?: 'feature' | 'bug' | 'hotfix' | 'other';
    jiraAddress?: string;
    prdAddress?: string;
    frontEndDevelopsIds?: string[];
    backEndDevelopsIds?: string[];
    expectLaunchTime?: string;
  }) {
    const { id, ...updateFields } = data;

    // 构建更新对象
    const updateData = {
      ...updateFields,
      // 如果存在前端开发者ID数组，将其转换为 ObjectId 数组
      ...(updateFields.frontEndDevelopsIds && {
        frontEndDevelopsIds: updateFields.frontEndDevelopsIds.map(id => new ObjectId(id))
      }),
      // 如果存在后端开发者ID数组，将其转换为 ObjectId 数组
      ...(updateFields.backEndDevelopsIds && {
        backEndDevelopsIds: updateFields.backEndDevelopsIds.map(id => new ObjectId(id))
      }),
    };

    // 使用 updateOne 方法更新任务
    const result = await this.taskModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      throw new Error('任务不存在');
    }
    return await this.taskModel.updateOne({
      _id: new ObjectId(id)
    }, {
      $set: updateData
    })
  }

  // 删除任务
  async deleteTaskById(id: string) {
    return await this.taskModel.deleteOne({
      _id: new ObjectId(id)
    })
  }

  // 获取任务信息
  async getTaskInfoById(taskId: string) {
    const results = await this.taskModel.aggregate([
      {
        $match: {
          _id: new ObjectId(taskId)
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'frontEndDevelopsIds',
          foreignField: '_id',
          as: 'frontEndDevelops'
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'backEndDevelopsIds',
          foreignField: '_id',
          as: 'backEndDevelops'
        }
      },
    ]).map(item => mapObjectId(item)).toArray()
    return results[0] || null;
  }

  // PM确认
  async pmConfirmed(taskId: string) {
    // 获取所有的taskId是当前值的，并且加上pmConfirmed: true
    const results = await this.taskInfoModel.updateMany({
      taskId: new ObjectId(taskId)
    }, {
      $set: {
        confirmed: true
      }
    })
    return results
  }

  // 开发确认
  async devConfirmed(data: {
    taskId: string,
    inputRatio: number,
    startDate: string
  }) {
    const userId: string = this.ctx.userId;
    // 根据taskId来拿到当前信息
    const task = await this.taskModel.findOne(
      {
        where: {
          _id: new ObjectId(data.taskId)
        }
      }
    )
    // 检查是否为开发人员
    const isDev = task.frontEndDevelopsIds.some(id => id.equals(new ObjectId(userId))) || 
              task.backEndDevelopsIds.some(id => id.equals(new ObjectId(userId)));
    if (!isDev) {
      throw new Error('您不是开发人员');
    }
    const developerMap = task.developerMap;
    developerMap[userId] = {
      inputRatio: data.inputRatio,
      startDate: data.startDate
    }
    return await this.taskModel.updateOne({
      _id: new ObjectId(data.taskId)
    }, {
      $set: { developerMap }
    })
  }

}