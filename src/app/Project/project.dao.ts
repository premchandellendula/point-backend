import type { Prisma, PrismaClient, Project, Role } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { projectDetailSelect, projectSelect } from "./project.schema.js";

export class ProjectDao extends BaseDao<
    Project,
    string,
    Prisma.ProjectUncheckedCreateInput,
    Prisma.ProjectUpdateInput,
    Prisma.ProjectWhereInput
> {
    constructor(private readonly prisma: PrismaClient){
        super(prisma.project, "Project");
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }

    createWithCreator(data: Omit<Prisma.ProjectUncheckedCreateInput, "createdById">, creatorId: string) {
        return this.prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: { ...data, createdById: creatorId },
                select: projectSelect,
            })
            await tx.projectMember.create({
                data: { projectId: project.id, userId: creatorId, role: "ADMIN" }
            })
            return project;
        })
    }

    findScoped(id: string, scope: Prisma.ProjectWhereInput) {
        return this.prisma.project.findFirst({ where: { id, ...scope }, select: projectDetailSelect })
    }

    async tagsInCompany(tagIds: string[], companyId: string) {
        const unique = [...new Set(tagIds)];
        const count = await this.prisma.tag.count({ where: { id: { in: unique }, companyId } });
        return count === unique.length;
    }
    
    existsInCompany(id: string, companyId: string) {
        return this.prisma.project.count({ where: { id, companyId } }).then((c) => c > 0);
    }

    userInCompany(userId: string, companyId: string) {
        return this.prisma.user.count({ where: { id: userId, companyId } }).then((c) => c > 0)
    }

    addMember(projectId: string, userId: string, role: Role) {
        return this.prisma.projectMember.create({
            data: { projectId, userId, role },
            select: { projectId: true, userId: true, role: true, joinedAt: true }
        })
    }

    async removeMember(projectId: string, userId: string) {
        const r = await this.prisma.projectMember.deleteMany({ where: { projectId, userId } });
        return r.count;
    }
}