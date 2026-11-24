import type { Prisma, PrismaClient, WorkflowStatus } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { statusSelect } from "./workflowStatus.schema.js";

export class WorkflowStatusDao extends BaseDao<
    WorkflowStatus,
    string,
    Prisma.WorkflowStatusUncheckedCreateInput,
    Prisma.WorkflowStatusUncheckedUpdateInput,
    Prisma.WorkflowStatusWhereInput
>{
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.workflowStatus, "WorkflowStatus");
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }

    listByCompany(companyId: string) {
        return this.prisma.workflowStatus.findMany({
            where: { companyId },
            select: statusSelect,
            orderBy: { position: "asc" }
        })
    }

    findInCompany(id: string, companyId: string) {
        return this.prisma.workflowStatus.findFirst({ where :{ id, companyId }, select: statusSelect });
    }

    async allInCompany(ids: string[], companyId: string) {
        const unique = [...new Set(ids)];
        const count = await this.prisma.workflowStatus.count({ where: { id: { in: unique }, companyId } });
        return count === unique.length;
    }

    async createStatus(data: { name: string, category: Prisma.WorkflowStatusUncheckedCreateInput["category"]; color?: string; companyId: string}) {
        const last = await this.prisma.workflowStatus.aggregate({
            where: { companyId: data.companyId },
            _max: { position: true }
        });
        return this.prisma.workflowStatus.create({
            data: { ...data, position: (last._max.position ?? 0) + 1 },
            select: statusSelect
        })
    }

    updateStatus(id: string, data: Prisma.WorkflowStatusUncheckedUpdateInput) {
        return this.prisma.workflowStatus.update({ where: { id }, data, select: statusSelect });
    }

    deleteStatus(id: string) {
        return this.prisma.workflowStatus.delete({ where: { id }, select: { id: true } });
    }

    reorder(ids: string[]){
        return this.prisma.$transaction(
            ids.map((id, i) => this.prisma.workflowStatus.update({ where: { id }, data: { position: i + 1 }, select: { id: true } }))
        )
    }

    setDefault(id: string, companyId: string) {
        return this.prisma.$transaction([
            this.prisma.workflowStatus.updateMany({ where: { companyId }, data: { isDefault: false } }),
            this.prisma.workflowStatus.update({ where: { id }, data: { isDefault: true}, select: { id: true } }),
        ]);
    }

    listTransitions(fromStatusId: string) {
        return this.prisma.statusTransition.findMany({
            where: { fromStatusId },
            select: { to: { select: statusSelect } },
        });
    }

    setTransitions(fromStatusId: string, toStatusIds: string[]) {
        const unique = [...new Set(toStatusIds)];
        return this.prisma.$transaction([
            this.prisma.statusTransition.deleteMany({ where: { fromStatusId } }),
            this.prisma.statusTransition.createMany({
                data: unique.map((toStatusId) => ({ fromStatusId, toStatusId })),
            }),
        ]);
    }
}