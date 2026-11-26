import type { Activity, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { historySelect } from "./activity.schema.js";

export class ActivityDao extends BaseDao<
    Activity,
    string,
    Prisma.ActivityUncheckedCreateInput,
    Prisma.ActivityUncheckedUpdateInput,
    Prisma.ActivityWhereInput
>{
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.activity, "Activity");
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }
    
    projectAccessible(projectId: string, scope: Prisma.ProjectWhereInput) {
        return this.prisma.project.count({ where: { id: projectId, ...scope } }).then((c) => c > 0);
    }

    taskAccessible(taskId: string, scope: Prisma.ProjectWhereInput) {
        return this.prisma.task.count({ where: { id: taskId, project: scope } }).then((c) => c > 0);
    }

    historyByTask(taskId: string) {
        return this.prisma.taskStatusHistory.findMany({
            where: { taskId },
            select: historySelect,
            orderBy: { changedAt: "asc" },
        });
    }
}