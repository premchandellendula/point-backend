import type { Prisma } from "../../generated/prisma/client.js";
import type { AuthUser } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { TimeLogDao } from "./timeLog.dao.js";
import type { ManualLogDto, StartTimerDto, UpdateTimeLogDto } from "./timeLog.schema.js";

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
};

export class TimeLogService {
    constructor(private readonly dao: TimeLogDao){}

    private scope(user: AuthUser, companyId: string): Prisma.ProjectWhereInput {
        return user.role === "ADMIN"
            ? { companyId }
            : { companyId, members: { some: { userId: user.id } } };
    }

    private async taskAccessible(user: AuthUser, taskId: string) {
        const companyId = await this.dao.getCompanyId(user.id);
        if(!companyId) return false;
        return !!(await this.dao.findTaskScoped(taskId, this.scope(user, companyId)))
    }

    async start(user: AuthUser, taskId: string, data: StartTimerDto) {
        try {
            if(!(await this.taskAccessible(user, taskId))) return new Result(true, ResultCode.NotFound, "Task not found");

            const running = await this.dao.findRunningOnTask(taskId, user.id);
            if (running) {
                return new Result(true, ResultCode.Conflict, "Timer is already running on this task");
            }
            const log = await this.dao.startTimer(taskId, user.id, data.note);
            return new Result(false, ResultCode.Created, "Timer started", log);
        } catch (error) {
            return serverError(error);
        }
    }

    async stop(user: AuthUser, taskId: string) {
        try {
            if (!(await this.taskAccessible(user, taskId))) return new Result(true, ResultCode.NotFound, "Task not found");

            const running = await this.dao.findRunningOnTask(taskId, user.id);
            if (!running) return new Result(true, ResultCode.NotFound, "No running timer on this task");

            const log = await this.dao.stopTimer(running.id, running.startedAt);
            return new Result(false, ResultCode.Success, "Timer stopped", log);
        } catch (error) {
            return serverError(error);
        }
    }

    async running(user: AuthUser) {
        try {
            const log = await this.dao.runningForUser(user.id);
            return new Result(false, ResultCode.Success, "Success in read", log);
        } catch (error) {
            return serverError(error);
        }
    }

    async addManual(user: AuthUser, taskId: string, data: ManualLogDto) {
        try {
            if (!(await this.taskAccessible(user, taskId))) return new Result(true, ResultCode.NotFound, "Task not found");

            const log = await this.dao.createManual(taskId, user.id, data);
            return new Result(false, ResultCode.Created, "Time logged", log);
        } catch (error) {
            return serverError(error);
        }
    }

    async list(user: AuthUser, taskId: string) {
        try {
            if (!(await this.taskAccessible(user, taskId))) return new Result(true, ResultCode.NotFound, "Task not found");

            return new Result(false, ResultCode.Success, "Success in read", await this.dao.listByTask(taskId));
        } catch (error) {
            return serverError(error);
        }
    }

    private async loadOwned(user: AuthUser, id: string) {
        const companyId = await this.dao.getCompanyId(user.id);
        const log = companyId ? await this.dao.findLogScoped(id, this.scope(user, companyId)) : null;
        if (!log) return { error: new Result(true, ResultCode.NotFound, "Time log not found") };
        if (log.userId !== user.id && user.role !== "ADMIN") {
            return { error: new Result(true, ResultCode.Forbidden, "Forbidden") };
        }
        return { log };
    }

    async update(user: AuthUser, id: string, data: UpdateTimeLogDto) {
        try {
            const { log, error } = await this.loadOwned(user, id);
            if (error) return error;
            if (!log.endedAt) return new Result(true, ResultCode.BadRequest, "Stop the timer before editing it");

            const startedAt = data.startedAt ?? log.startedAt;
            const endedAt = data.endedAt ?? log.endedAt;
            if (endedAt <= startedAt) return new Result(true, ResultCode.BadRequest, "endedAt must be after startedAt");

            const updated = await this.dao.updateLog(id, { startedAt, endedAt, note: data.note });
            return new Result(false, ResultCode.Success, "Time log updated", updated);
        } catch (error) {
            return serverError(error);
        }
    }

    async remove(user: AuthUser, id: string) {
        try {
            const { error } = await this.loadOwned(user, id);
            if (error) return error;

            await this.dao.deleteLog(id);
            return new Result(false, ResultCode.Success, "Time log deleted");
        } catch (error) {
            return serverError(error);
        }
    }
}