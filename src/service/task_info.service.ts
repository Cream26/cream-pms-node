import { Provide, Inject } from "@midwayjs/core";
import { TaskInfo } from "../entity/task_info.entity";
import { MongoRepository } from "typeorm";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Context } from "@midwayjs/koa";
import { ObjectId } from 'mongodb';
import { mapObjectId } from "../utils/mongodbHelp";

@Provide()
export class TaskInfoService {
  @InjectEntityModel(TaskInfo)
  taskInfoModel: MongoRepository<TaskInfo>;

  @Inject()
  ctx: Context;

  // 创建任务详情
  async createTaskInfo(data: TaskInfo) {
    const taskInfo = new TaskInfo();
    Object.assign(taskInfo, {
      ...data,
      taskId: new ObjectId(data.taskId),
      implementer: new ObjectId(data.implementer)
    });
    return await this.taskInfoModel.save(taskInfo);
  }

  // 更新任务详情
  async updateTaskInfoById(data: TaskInfo) {
    const { id, ...taskInfo } = data;
    const objectId = new ObjectId(id);
    if (taskInfo.implementer) {
      taskInfo.implementer = new ObjectId(taskInfo.implementer);
    }
    if (taskInfo.taskId) {
      taskInfo.taskId = new ObjectId(taskInfo.taskId);
    }
    return await this.taskInfoModel.updateOne(
      {
        _id: objectId
      },
      {
        $set: taskInfo
      }
    );
  }

  // 获取任务明细列表
  async getTaskDetailList(taskId: string) {
    const objectId = new ObjectId(taskId); // 确保 taskId 是 ObjectId

    const taskDetails = await this.taskInfoModel.aggregate([
      {
        $match: {
          taskId: objectId // 匹配指定的 taskId
        }
      },
      {
        $lookup: {
          from: 'user', // 用户表的集合名称
          localField: 'implementer', // 当前任务的执行人字段
          foreignField: '_id', // 用户表中的 ID 字段
          as: 'implementerInfo' // 返回的执行人信息数组
        }
      },
      {
        $unwind: {
          path: '$implementerInfo', // 将执行人信息展开为对象
          preserveNullAndEmptyArrays: true // 如果没有找到执行人信息，保留原始文档
        }
      }
    ]).map(item => mapObjectId(item)).toArray();

    return taskDetails; // 返回任务明细数组
  }

  // 任务的状态改变
  async updateTaskInfoStatus(data: {
    id: string
    status: string
  }) {
    const { id, status } = data;
    return await this.taskInfoModel.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
  }
}