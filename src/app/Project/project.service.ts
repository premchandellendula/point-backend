import type { Prisma } from "../../generated/prisma/client.js";
import type { AuthUser } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { ProjectDao } from "./project.dao.js";
import { projectSelect, type AddMemberDto, type CreateProjectDto, type ListProjectsQuery, type UpdateProjectDto } from "./project.schema.js";

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
};

export class ProjectService {
    constructor(private readonly dao: ProjectDao){}

    // admins see the whole company, others only projects they are a member of
    private scope(user: AuthUser, companyId: string): Prisma.ProjectWhereInput {
        return user.role === "ADMIN"
            ? { companyId }
            : { companyId, members: { some: { userId: user.id } } };
    }

    async create(user: AuthUser, data: CreateProjectDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if(!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

            const { tagIds, ...rest } = data;
            if (tagIds?.length && !(await this.dao.tagsInCompany(tagIds, companyId))) {
                return new Result(true, ResultCode.BadRequest, "Invalid tags");
            }

            const project = await this.dao.createWithCreator({ ...rest, companyId, ...(tagIds?.length && { tags: { connect: [...new Set(tagIds)].map((id) => ({ id })) } }) }, user.id);
            return new Result(false, ResultCode.Created, "Project created", project);
        } catch (error) {
            return serverError(error);
        }
    }

    async list(user: AuthUser, query: ListProjectsQuery) {
        const companyId = await this.dao.getCompanyId(user.id);
        if(!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

        return this.dao.readMany({
            page: query.page,
            count: query.count,
            where: this.scope(user, companyId),
            select: projectSelect
        })
    }

    async get(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

            const project = await this.dao.findScoped(id, this.scope(user, companyId));
            if(!project) return new Result(true, ResultCode.NotFound, "Project not found");

            return new Result(false, ResultCode.Success, "Success in read", project);
        } catch (error) {
            return serverError(error);
        }
    }

    async update(user: AuthUser, id: string, data: UpdateProjectDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.existsInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Project not found");
            }
            const { tagIds, ...fields } = data;
            if (tagIds?.length && !(await this.dao.tagsInCompany(tagIds, companyId))) {
                return new Result(true, ResultCode.BadRequest, "Invalid tags");
            }
            return await this.dao.update(id, {
                ...fields,
                ...(tagIds && { tags: { set: [...new Set(tagIds)].map((id) => ({ id })) } })
            });
        } catch (error) {
            return serverError(error);
        }
    }

    async addMember(user: AuthUser, projectId: string, data: AddMemberDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if(!companyId || !(await this.dao.existsInCompany(projectId, companyId))){
                return new Result(true, ResultCode.NotFound, "Project not found");
            }

            if(!(await this.dao.userInCompany(data.userId, companyId))){
                return new Result(true, ResultCode.NotFound, "User not found in your company");
            }

            const member = await this.dao.addMember(projectId, data.userId, data.role);
            return new Result(false, ResultCode.Created, "Member added", member);
        } catch (error) {
            if ((error as { code?: string }).code === "P2002") {
                return new Result(true, ResultCode.Conflict, "User is already a member");
            }
            return serverError(error);
        }
    }

    async removeMember(user: AuthUser, projectId: string, userId: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.existsInCompany(projectId, companyId))) {
                return new Result(true, ResultCode.NotFound, "Project not found");
            }

            const removed = await this.dao.removeMember(projectId, userId);
            if (removed === 0) return new Result(true, ResultCode.NotFound, "Member not found");

            return new Result(false, ResultCode.Success, "Member removed");
        } catch (error) {
            return serverError(error);
        }
    }
}