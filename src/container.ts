import { ActivityController } from "./app/Activity/activity.controller.js";
import { ActivityDao } from "./app/Activity/activity.dao.js";
import { ActivityService } from "./app/Activity/activity.service.js";
import { AttachmentController } from "./app/Attachment/attachment.controller.js";
import { AttachmentDao } from "./app/Attachment/attachment.dao.js";
import { AttachmentService } from "./app/Attachment/attachment.service.js";
import { RefreshTokenDao } from "./app/auth/refreshToken.dao.js";
import { CompanyController } from "./app/Company/company.controller.js";
import { CompanyDao } from "./app/Company/company.dao.js";
import { CompanyService } from "./app/Company/company.service.js";
import { InvitationController } from "./app/Invitation/invitation.controller.js";
import { InvitationDao } from "./app/Invitation/invitation.dao.js";
import { InvitationService } from "./app/Invitation/invitation.service.js";
import { ProjectController } from "./app/Project/project.controller.js";
import { ProjectDao } from "./app/Project/project.dao.js";
import { ProjectService } from "./app/Project/project.service.js";
import { TagController } from "./app/Tag/tag.controller.js";
import { TagDao } from "./app/Tag/tag.dao.js";
import { TagService } from "./app/Tag/tag.service.js";
import { TaskController } from "./app/Task/task.controller.js";
import { TaskDao } from "./app/Task/task.dao.js";
import { TaskService } from "./app/Task/task.service.js";
import { TimeLogController } from "./app/TimeLog/timeLog.controller.js";
import { TimeLogDao } from "./app/TimeLog/timeLog.dao.js";
import { TimeLogService } from "./app/TimeLog/timeLog.service.js";
import { UserController } from "./app/User/user.controller.js";
import { UserDao } from "./app/User/user.dao.js";
import { UserService } from "./app/User/user.service.js";
import { WorkflowStatusController } from "./app/WorkflowStatus/workflowStatus.controller.js";
import { WorkflowStatusDao } from "./app/WorkflowStatus/workflowStatus.dao.js";
import { WorkflowStatusService } from "./app/WorkflowStatus/workflowStatus.service.js";
import { env } from "./config/env.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { SupabaseFileStorage } from "./shared/storage/supabase.storage.js";
import { FileUploader } from "./shared/storage/uploader.js";

export function buildContainer(prisma: PrismaClient) {
    const storage = new SupabaseFileStorage(env.supabaseUrl, env.supabaseKey);
    const uploader = new FileUploader(storage);
    
    const userDao = new UserDao(prisma);
    const refreshTokenDao = new RefreshTokenDao(prisma);
    const companyDao = new CompanyDao(prisma);
    const invitationDao = new InvitationDao(prisma);
    const projectDao = new ProjectDao(prisma);
    const taskDao = new TaskDao(prisma);
    const tagDao = new TagDao(prisma);
    const workflowStatusDao = new WorkflowStatusDao(prisma);
    const timeLogDao = new TimeLogDao(prisma);
    const attachmentDao = new AttachmentDao(prisma);
    const activityDao = new ActivityDao(prisma);

    const userService = new UserService(userDao, refreshTokenDao);
    const companyService = new CompanyService(companyDao);
    const invitationService = new InvitationService(invitationDao);
    const projectService = new ProjectService(projectDao);
    const taskService = new TaskService(taskDao, uploader);
    const tagService = new TagService(tagDao);
    const workflowStatusService = new WorkflowStatusService(workflowStatusDao);
    const timeLogService = new TimeLogService(timeLogDao);
    const attachmentService = new AttachmentService(attachmentDao, uploader);
    const activityService = new ActivityService(activityDao);

    const userController = new UserController(userService);
    const companyController = new CompanyController(companyService);
    const invitationController = new InvitationController(invitationService);
    const projectController = new ProjectController(projectService);
    const taskController = new TaskController(taskService);
    const tagController = new TagController(tagService);
    const workflowStatusController = new WorkflowStatusController(workflowStatusService);
    const timeLogController = new TimeLogController(timeLogService);
    const attachmentController = new AttachmentController(attachmentService);
    const activityController = new ActivityController(activityService);

    return { userController, companyController, invitationController, projectController, taskController, tagController, workflowStatusController, timeLogController, attachmentController, activityController };
}

export type Container = ReturnType<typeof buildContainer>;