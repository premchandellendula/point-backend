import type { Prisma } from "../../generated/prisma/client.js";
import type { AuthUser } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { TaskDao } from "./task.dao.js";
import { taskSelect, type ChangeStatusDto, type CreateTaskDto, type ListTasksQuery, type UpdateTaskDto } from "./task.schema.js";

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
};

export class TaskService {
    constructor(private readonly dao: TaskDao) {}

    private scope(user: AuthUser, companyId: string): Prisma.ProjectWhereInput {
        return user.role === "ADMIN"
            ? { companyId }
            : { companyId, members: { some: { userId: user.id } } };
    }

    async create(user: AuthUser, projectId: string, data: CreateTaskDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if(!companyId || !(await this.dao.projectAccessible(projectId, this.scope(user, companyId)))){
                return new Result(true, ResultCode.NotFound, "Project not found")
            }

            const { statusId: requestedStatus, ...rest } = data;
            if(rest.assigneeId && !(await this.dao.isProjectMember(projectId, rest.assigneeId))){
                return new Result(true, ResultCode.BadRequest, "Assignee is not a member of this project");
            }
            if (rest.parentId && !(await this.dao.taskInProject(rest.parentId, projectId))) {
                return new Result(true, ResultCode.BadRequest, "Parent task not found in this project");
            }

            let statusId = requestedStatus;
            if(statusId) {
                if(!(await this.dao.statusInCompany(statusId, companyId))) {
                    return new Result(true, ResultCode.BadRequest, "Invalid status")
                }
            }else {
                const def = await this.dao.defaultStatus(companyId);
                if(!def) return new Result(true, ResultCode.InternalServerError, "No default status configured");
                statusId = def.id;
            }

            const task = await this.dao.createWithHistory(rest, projectId, statusId, user.id);
            return new Result(false, ResultCode.Created, "Task created", task);
        } catch (error) {
            return serverError(error);
        }
    }

    async list(user: AuthUser, projectId: string, q: ListTasksQuery) {
        const companyId = await this.dao.getCompanyId(user.id);
        if(!companyId || !(await this.dao.projectAccessible(projectId, this.scope(user, companyId)))){
            return new Result(true, ResultCode.NotFound, "Project not found");
        }

        const where: Prisma.TaskWhereInput = {
            projectId,
            ...(q.type && { type: q.type }),
            ...(q.statusId && { statusId: q.statusId }),
            ...(q.assigneeId && { assigneeId: q.assigneeId }),
            ...(q.priority && { priority: q.priority }),
            ...(q.parentId && { parentId: q.parentId }),
            ...(q.search && { title: { contains: q.search, mode: "insensitive" } }),
        }

        return this.dao.readMany({ page: q.page, count: q.count, where, select: taskSelect });
    }

    async get(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId) return new Result(true, ResultCode.NotFound, "Task not found");

            const task = await this.dao.findScoped(id, this.scope(user, companyId));
            if (!task) return new Result(true, ResultCode.NotFound, "Task not found");

            return new Result(false, ResultCode.Success, "Success in read", task);
        } catch (error) {
            return serverError(error);
        }
    }

    async update(user: AuthUser, id: string, data: UpdateTaskDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            const task = companyId ? await this.dao.findScoped(id, this.scope(user, companyId)) : null;
            if (!task) return new Result(true, ResultCode.NotFound, "Task not found");

            if (data.assigneeId && !(await this.dao.isProjectMember(task.projectId, data.assigneeId))) {
                return new Result(true, ResultCode.BadRequest, "Assignee is not a member of this project");
            }

            return await this.dao.update(id, data);
        } catch (error) {
            return serverError(error);
        }
    }

    async changeStatus(user: AuthUser, id: string, data: ChangeStatusDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            const task = companyId ? await this.dao.findScoped(id, this.scope(user, companyId)) : null;
            if(!companyId || !task) return new Result(true, ResultCode.NotFound, "Task not found");

            if(!(await this.dao.statusInCompany(data.statusId, companyId))) {
                return new Result(true, ResultCode.BadRequest, "Invalid status");
            }

            if(task.statusId === data.statusId) {
                return new Result(true, ResultCode.BadRequest, "Task is already in this status")
            }

            if(!(await this.dao.transitionAllowed(task.statusId, data.statusId))) {
                return new Result(true, ResultCode.BadRequest, "This status change is not allowed");
            }

            const updated = await this.dao.changeStatus(id, task.projectId, task.statusId, data.statusId, user.id);
            return new Result(false, ResultCode.Success, "Status updated", updated);
        } catch (error) {
            return serverError(error);
        }
    }
}
