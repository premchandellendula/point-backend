import type { Prisma, PrismaClient, Tag } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { tagSelect } from "./tag.schema.js";

export class TagDao extends BaseDao<
    Tag,
    string,
    Prisma.TagUncheckedCreateInput,
    Prisma.TagUncheckedUpdateInput,
    Prisma.TagWhereInput
>{
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.tag, "Tag");
    }

    async getCompanyId(userId: string) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
        return u?.companyId ?? null;
    }

    listByCompany(companyId: string) {
        return this.prisma.tag.findMany({ where: { companyId }, select: tagSelect, orderBy: { name: "asc" } });
    }

    existsInCompany(id: string, companyId: string) {
        return this.prisma.tag.count({ where: { id, companyId } }).then((c) => c > 0);
    }

    createTag(data: Prisma.TagUncheckedCreateInput) {
        return this.prisma.tag.create({ data, select: tagSelect });
    }

    updateTag(id: string, data: Prisma.TagUncheckedUpdateInput) {
        return this.prisma.tag.update({ where: { id }, data, select: tagSelect });
    }

    deleteTag(id: string) {
        return this.prisma.tag.delete({ where: { id }, select: { id: true } });
    }
}