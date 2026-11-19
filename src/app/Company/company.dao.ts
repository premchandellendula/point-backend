import type { Company, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { userSelect } from "../User/user.schema.js";

const DEFAULT_STATUSES = [
    ["Unassigned", "OPEN"], ["Assigned", "OPEN"], ["Open", "OPEN"], ["Reopened", "OPEN"],
    ["In Progress", "IN_PROGRESS"], ["On Hold", "IN_PROGRESS"], ["In Review", "IN_PROGRESS"],
    ["Ready for Testing", "IN_PROGRESS"], ["Testing", "IN_PROGRESS"], ["In Staging", "IN_PROGRESS"],
    ["Staging Ready", "IN_PROGRESS"], ["Failed", "IN_PROGRESS"], ["Passed", "IN_PROGRESS"],
    ["Ready for Deployment", "IN_PROGRESS"],
    ["Deployed", "DONE"], ["Completed", "DONE"], ["Verified", "DONE"],
    ["Closed", "CLOSED"], ["Cancelled", "CLOSED"], ["Removed", "CLOSED"],
] as const;

export class CompanyDao extends BaseDao<
    Company,
    string,
    Prisma.CompanyCreateInput,
    Prisma.CompanyUpdateInput,
    Prisma.CompanyWhereInput
>{
    constructor(private readonly prisma: PrismaClient){
        super(prisma.company, "Company")
    }

    createWithAdmin(
        companyName: string,
        user: { fullName: string; email: string; passwordHash: string }
    ) {
        return this.prisma.$transaction(async (tx) => {
            const company = await tx.company.create({ data: { name: companyName }})

            await tx.workflowStatus.createMany({
                data: DEFAULT_STATUSES.map(([name, category], i) => ({
                    name,
                    category,
                    position: i + 1,
                    isDefault: i === 0,
                    companyId: company.id
                }))
            })

            const { passwordHash, ...rest } = user;
            const admin = await tx.user.create({
                data: { ...rest, password: passwordHash, role: "ADMIN", companyId: company.id },
                select: userSelect
            })

            return { company, user: admin }
        })
    }
}