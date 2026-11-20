import type { Prisma, PrismaClient, Task } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { taskSelect } from "./task.schema.js";

export class TaskDao extends BaseDao<
    Task,
    string,
    Prisma.TaskUncheckedCreateInput,
    Prisma.TaskUncheckedUpdateInput,
    Prisma.TaskWhereInput
>{
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.task, "Task");
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true, } });
        return u?.companyId ?? null;
    }

    projectAccessible(projectId: string, scope: Prisma.ProjectWhereInput) {
        return this.prisma.project
            .count({ where: { id: projectId, ...scope } })
            .then((c) => c > 0);
    }

    isProjectMember(projectId: string, userId: string) {
        return this.prisma.projectMember
            .count({ where: { projectId, userId } })
            .then((c) => c > 0);
    }

    taskInProject(taskId: string, projectId: string) {
        return this.prisma.task.count({ where: { id: taskId, projectId } }).then((c) => c > 0);
    }

    statusInCompany(statusId: string, companyId: string) {
        return this.prisma.workflowStatus.count({ where: { id: statusId, companyId } }).then((c) => c > 0);
    }

    defaultStatus(companyId: string) {
        return this.prisma.workflowStatus.findFirst({
            where: { companyId, isDefault: true },
            select: { id: true },
        })
    }

    async transitionAllowed(fromId: string, toId: string) {
        const rules = await this.prisma.statusTransition.findMany({
            where: { fromStatusId: fromId },
            select: { toStatusId: true }
        })
        return rules.length === 0 || rules.some((r) => r.toStatusId === toId);
    }

    findScoped(id: string, scope: Prisma.ProjectWhereInput) {
        return this.prisma.task.findFirst({
            where: { id, project: scope },
            select: { ...taskSelect, statusId: true }
        })
    }

    createWithHistory(
        data: Omit<Prisma.TaskUncheckedCreateInput, "createdById" | "projectId" | "statusId">,
        projectId: string,
        statusId: string,
        actorId: string
    ) {
        return this.prisma.$transaction(async (tx) => {
            const task = await tx.task.create({
                data: { ...data, projectId, statusId, createdById: actorId},
                select: taskSelect
            })

            await tx.taskStatusHistory.create({
                data: { taskId: task.id, toStatusId: statusId, changedById: actorId }
            })

            await tx.activity.create({
                data: { projectId, taskId: task.id, actorId, action: "task.created "}
            })
            return task;
        })
    }

    changeStatus(taskId: string, projectId: string, fromId: string, toId: string, actorId: string) {
        return this.prisma.$transaction(async (tx) => {
            const task = await tx.task.update({
                where: { id: taskId },
                data: { statusId: toId },
                select: taskSelect,
            });
            await tx.taskStatusHistory.create({
                data: { taskId, fromStatusId: fromId, toStatusId: toId, changedById: actorId },
            });
            await tx.activity.create({
                data: {
                    projectId,
                    taskId,
                    actorId,
                    action: "status.changed",
                    metadata: { from: fromId, to: toId },
                },
            });
            return task;
        });
    }
}