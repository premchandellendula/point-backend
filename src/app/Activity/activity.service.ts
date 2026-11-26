import type { Prisma } from "../../generated/prisma/client.js";
import type { AuthUser } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { ActivityDao } from "./activity.dao.js";
import { activitySelect, type ListActivityQuery } from "./activity.schema.js";

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
};

export class ActivityService {
    constructor(private readonly dao: ActivityDao){}

    private scope(user: AuthUser, companyId: string): Prisma.ProjectWhereInput {
        return user.role === "ADMIN"
            ? { companyId }
            : { companyId, members: { some: { userId: user.id } } };
    }

    async projectActivity(user: AuthUser, projectId: string, q: ListActivityQuery) {
        const companyId = await this.dao.getCompanyId(user.id);
        if (!companyId || !(await this.dao.projectAccessible(projectId, this.scope(user, companyId)))) {
            return new Result(true, ResultCode.NotFound, "Project not found");
        }
        return this.dao.readMany({ page: q.page, count: q.count, where: { projectId }, select: activitySelect });
    }

    async taskActivity(user: AuthUser, taskId: string, q: ListActivityQuery) {
        const companyId = await this.dao.getCompanyId(user.id);
        if (!companyId || !(await this.dao.taskAccessible(taskId, this.scope(user, companyId)))) {
            return new Result(true, ResultCode.NotFound, "Task not found");
        }
        return this.dao.readMany({ page: q.page, count: q.count, where: { taskId }, select: activitySelect });
    }

    async taskHistory(user: AuthUser, taskId: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.taskAccessible(taskId, this.scope(user, companyId)))) {
                return new Result(true, ResultCode.NotFound, "Task not found");
            }
            const taskHistory = await this.dao.historyByTask(taskId);
            return new Result(false, ResultCode.Success, "Success in read", taskHistory);
        } catch (error) {
            return serverError(error);
        }
    }
}