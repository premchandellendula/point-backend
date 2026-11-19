import type { Prisma, PrismaClient, User } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

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
}