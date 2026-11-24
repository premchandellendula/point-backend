import type { AuthUser } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { TagDao } from "./tag.dao.js";
import type { CreateTagDto, UpdateTagDto } from "./tag.schema.js";

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
}
const isDuplicate = (e: unknown) => (e as { code?: string }).code === "P2002";

export class TagService {
    constructor(private readonly dao: TagDao){}

    async create(user: AuthUser, data: CreateTagDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if(!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

            const tag = await this.dao.createTag({ ...data, companyId });
            return new Result(false, ResultCode.Created, "Tag created", tag);
        } catch (error) {
            if(isDuplicate(error)) return new Result(true, ResultCode.Conflict, "Tag already exists");
            return serverError(error);
        }
    }

    async list(user: AuthUser){
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if(!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

            const tags = await this.dao.listByCompany(companyId);
            return new Result(false, ResultCode.Success, "Success in read", tags);
        } catch (error) {
            return serverError(error);
        }
    }

    async update(user: AuthUser, id: string, data: UpdateTagDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.existsInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Tag not found");
            }
            const tag = await this.dao.updateTag(id, data);
            return new Result(false, ResultCode.Success, "Tag updated", tag);
        } catch (error) {
            if (isDuplicate(error)) return new Result(true, ResultCode.Conflict, "Tag already exists");
            return serverError(error);
        }
    }

    async remove(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.existsInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Tag not found");
            }

            await this.dao.deleteTag(id);
            return new Result(false, ResultCode.Success, "Tag deleted");
        } catch (error) {
            return serverError(error);
        }
    }
}