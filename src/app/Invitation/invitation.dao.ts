import type { Invitation, Prisma, PrismaClient, Role } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { userSelect } from "../User/user.schema.js";

export class InvitationDao extends BaseDao<
    Invitation,
    string,
    Prisma.InvitationUncheckedCreateInput,
    Prisma.InvitationUpdateInput,
    Prisma.InvitationWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.invitation, "Invitation")
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }

    async emailTaken(email: string){
        return (await this.prisma.user.count({ where: { email } })) > 0;
    }

    createReplacingPending(data: Prisma.InvitationUncheckedCreateInput) {
        return this.prisma.$transaction(async (tx) => {
            await tx.invitation.updateMany({
                where: { companyId: data.companyId, email: data.email, status: "PENDING" },
                data: { status: "REVOKED" },
            });

            return tx.invitation.create({
                data,
                select: { id: true, email: true, expiresAt: true }
            })
        })
    }

    findByTokenHash(token: string) {
        return this.prisma.invitation.findUnique({ where: { token }});
    }

    acceptWithUser(
        inv: { id: string; email: string; role: Role; companyId: string },
        user: { fullName: string; password: string; avatarUrl?: string; jobTitle?: string}
    ) {
        return this.prisma.$transaction(async (tx) => {
            const claimed = await tx.invitation.updateMany({
                where: { id: inv.id, status: "PENDING" },
                data: { status: "ACCEPTED" }
            });

            if(claimed.count === 0) throw new Error("INVITE_NOT_PENDING");

            return tx.user.create({
                data: {
                    ...user,
                    email: inv.email,
                    role: inv.role,
                    companyId: inv.companyId,
                    emailVerifiedAt: new Date()
                },
                select: userSelect
            })
        })
    }
}