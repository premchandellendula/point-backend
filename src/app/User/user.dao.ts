import type { Prisma, PrismaClient, User } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { userSelect } from "./user.schema.js";

export const meSelect = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    emailVerifiedAt: true
} satisfies Prisma.UserSelect;

export class UserDao extends BaseDao<
    User,
    string,
    Prisma.UserUncheckedCreateInput,
    Prisma.UserUpdateInput,
    Prisma.UserWhereInput
>{
    constructor(private readonly prisma: PrismaClient){
        super(prisma.user, "User")
    }

    readByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email }})
    }

    readMe(id: string) {
        return this.prisma.user.findUnique({ where: { id }, select: meSelect });
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }

    findInCompany(id: string, companyId: string) {
        return this.prisma.user.findFirst({
            where: { id, companyId },
            select: { id: true, role: true, deactivatedAt: true },
        });
    }

    updateUser(id: string, data: Prisma.UserUncheckedUpdateInput) {
        return this.prisma.user.update({ where: { id }, data, select: userSelect });
    }

    setActive(id: string, active: boolean) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id },
                data: { deactivatedAt: active ? null : new Date() },
                select: userSelect,
            });
            if (!active) {
                // kill all sessions
                await tx.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
            }
            return user;
        });
    }
}