import type { Attachment, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { attachmentSelect } from "./attachment.schema.js";

export class AttachmentDao extends BaseDao<
    Attachment,
    string,
    Prisma.AttachmentUncheckedCreateInput,
    Prisma.AttachmentUncheckedUpdateInput,
    Prisma.AttachmentWhereInput
> {
    constructor(private readonly prisma: PrismaClient){
        super(prisma.attachment, "Attachment");
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }

    findTaskScoped(taskId: string, scope: Prisma.ProjectWhereInput) {
        return this.prisma.task.findFirst({ where: { id: taskId, project: scope }, select: { id: true, projectId: true } });
    }

    findScoped(id: string, scope: Prisma.ProjectWhereInput) {
        return this.prisma.attachment.findFirst({
            where: { id, task: { project: scope } },
            select: { id: true, fileUrl: true, fileName: true, uploadedById: true, task: { select: { id: true, projectId: true } } },
        })
    }

    listByTask(taskId: string){
        return this.prisma.attachment.findMany({
            where: { taskId },
            select: attachmentSelect,
            orderBy: { createdAt: "desc" }
        })
    }

    createWithActivity(
        data: Prisma.AttachmentUncheckedCreateInput,
        projectId: string
    ) {
        return this.prisma.$transaction(async (tx) => {
            const row = await tx.attachment.create({ data, select: attachmentSelect })
            await tx.activity.create({
                data: { 
                    projectId,
                    taskId: data.taskId,
                    actorId: data.uploadedById,
                    action: "attachment.added",
                    metadata: { fileName: data.fileName }
                }
            });
            return row;
        })
    }

    deleteWithActivity(id: string, projectId: string, taskId: string, actorId: string, fileName: string) {
        return this.prisma.$transaction(async (tx) => {
            await tx.attachment.delete({ where: { id } });
            await tx.activity.create({
                data: { projectId, taskId, actorId, action: "attachment.removed", metadata: { fileName } },
            });
        });
    }
}