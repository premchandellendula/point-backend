import type { Prisma, PrismaClient, Team } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { teamDetailSelect, teamSelect } from "./team.schema.js";

export class TeamDao extends BaseDao<
    Team,
    string,
    Prisma.TeamUncheckedCreateInput,
    Prisma.TeamUncheckedUpdateInput,
    Prisma.TeamWhereInput
> {
    constructor(private readonly prisma: PrismaClient){
        super(prisma.team, "Team");
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }

    listByCompany(companyId: string) {
        return this.prisma.team.findMany({ where: { companyId }, select: teamSelect, orderBy: { name: "asc" } });
    }

    findDetail(id: string, companyId: string) {
        return this.prisma.team.findFirst({ where: { id, companyId }, select: teamDetailSelect });
    }

    existsInCompany(id: string, companyId: string) {
        return this.prisma.team.count({ where: { id, companyId } }).then((c) => c > 0);
    }

     activeUserInCompany(userId: string, companyId: string) {
        return this.prisma.user
            .count({ where: { id: userId, companyId, deactivatedAt: null } })
            .then((c) => c > 0);
    }

    // these throw, so the service can see P2002
    createTeam(data: Prisma.TeamUncheckedCreateInput) {
        return this.prisma.team.create({ data, select: teamSelect });
    }
    
    updateTeam(id: string, data: Prisma.TeamUncheckedUpdateInput) {
        return this.prisma.team.update({ where: { id }, data, select: teamSelect });
    }

    deleteTeam(id: string) {
        return this.prisma.team.delete({ where: { id }, select: { id: true } }); // users' teamId becomes null
    }

    assignUser(userId: string, teamId: string) {
        return this.prisma.user.update({ where: { id: userId }, data: { teamId }, select: { id: true, teamId: true } });
    }

    async removeUser(userId: string, teamId: string) {
        const r = await this.prisma.user.updateMany({ where: { id: userId, teamId }, data: { teamId: null } });
        return r.count;
    }
}