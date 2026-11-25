import type { Prisma, PrismaClient, TimeLog } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { timeLogSelect } from "./timeLog.schema.js";

const secondsBetween = (start: Date, end: Date) => Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));

export class TimeLogDao extends BaseDao<
    TimeLog,
    string,
    Prisma.TimeLogUncheckedCreateInput,
    Prisma.TimeLogUncheckedUpdateInput,
    Prisma.TimeLogWhereInput
> {
    constructor(private readonly prisma: PrismaClient){
        super(prisma.timeLog, "TimeLog");
    }

    async getCompanyId(userId: string){
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }

    findTaskScoped(taskId: string, scope: Prisma.ProjectWhereInput){
        return this.prisma.task.findFirst({ where: { id: taskId, project: scope }, select: { id: true } });
    }

    findLogScoped(id: string, scope: Prisma.ProjectWhereInput){
        return this.prisma.timeLog.findFirst({
            where: { id, task: { project: scope } },
            select: { id: true, userId: true, startedAt: true, endedAt: true }
        })
    }

    findRunning(userId: string) {
        return this.prisma.timeLog.findFirst({
            where: { userId, endedAt: null },
            select: { id: true, taskId: true }
        })
    }

    findRunningOnTask(taskId: string, userId: string) {
        return this.prisma.timeLog.findFirst({
            where: { taskId, userId, endedAt: null },
            select: { id: true, startedAt: true },
        });
    }

    startTimer(taskId: string, userId: string, note?: string) {
        return this.prisma.timeLog.create({
            data: { taskId, userId, startedAt: new Date(), note },
            select: timeLogSelect,
        });
    }

    stopTimer(id: string, startedAt: Date) {
        const endedAt = new Date();
        return this.prisma.timeLog.update({
            where: { id },
            data: { endedAt, seconds: secondsBetween(startedAt, endedAt) },
            select: timeLogSelect,
        });
    }

    createManual(taskId: string, userId: string, d: { startedAt: Date; endedAt: Date; note?: string }) {
        return this.prisma.timeLog.create({
            data: { taskId, userId, ...d, seconds: secondsBetween(d.startedAt, d.endedAt) },
            select: timeLogSelect,
        });
    }

    updateLog(id: string, d: { startedAt: Date; endedAt: Date; note?: string | null }) {
        return this.prisma.timeLog.update({
            where: { id },
            data: { ...d, seconds: secondsBetween(d.startedAt, d.endedAt) },
            select: timeLogSelect,
        });
    }

    deleteLog(id: string) {
        return this.prisma.timeLog.delete({ where: { id }, select: { id: true } });
    }

    async listByTask(taskId: string) {
        const [items, sum] = await Promise.all([
            this.prisma.timeLog.findMany({ where: { taskId }, select: timeLogSelect, orderBy: { startedAt: "desc" } }),
            this.prisma.timeLog.aggregate({ where: { taskId }, _sum: { seconds: true } }),
        ]);
        return { items, totalSeconds: sum._sum.seconds ?? 0 };
    }

    runningForUser(userId: string) {
        return this.prisma.timeLog.findMany({
            where: { userId, endedAt: null },
            select: timeLogSelect,
            orderBy: { startedAt: "desc" },
        });
    }
}