import type { AuthUser } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { WorkflowStatusDao } from "./workflowStatus.dao.js";
import type { CreateStatusDto, ReorderDto, SetTransitionsDto, UpdateStatusDto } from "./workflowStatus.schema.js";

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
};
const code = (e: unknown) => (e as { code?: string }).code;

export class WorkflowStatusService {
    constructor(private readonly dao: WorkflowStatusDao) {}

    async create(user: AuthUser, data: CreateStatusDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

            const status = await this.dao.createStatus({ ...data, companyId });
            return new Result(false, ResultCode.Created, "Status created", status);
        } catch (error) {
            if (code(error) === "P2002") return new Result(true, ResultCode.Conflict, "Status name already exists");
            return serverError(error);
        }
    }

    async list(user: AuthUser) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId) return new Result(true, ResultCode.NotFound, "Company not found");
            const statuses = await this.dao.listByCompany(companyId)
            return new Result(false, ResultCode.Success, "Success in read", statuses);
        } catch (error) {
            return serverError(error);
        }
    }

    async update(user: AuthUser, id: string, data: UpdateStatusDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.findInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Status not found");
            }
            const status = await this.dao.updateStatus(id, data);
            return new Result(false, ResultCode.Success, "Status updated", status);
        } catch (error) {
            if (code(error) === "P2002") return new Result(true, ResultCode.Conflict, "Status name already exists");
            return serverError(error);
        }
    }

    async remove(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            const status = companyId ? await this.dao.findInCompany(id, companyId) : null;
            if (!status) return new Result(true, ResultCode.NotFound, "Status not found");

            if (status.isDefault) {
                return new Result(true, ResultCode.BadRequest, "Set another default status before deleting this one");
            }

            await this.dao.deleteStatus(id);
            return new Result(false, ResultCode.Success, "Status deleted");
        } catch (error) {
            // tasks or status history still reference it
            if (code(error) === "P2003") {
                return new Result(true, ResultCode.Conflict, "Status is used by tasks or task history");
            }
            return serverError(error);
        }
    }

    async reorder(user: AuthUser, data: ReorderDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

            const current = await this.dao.listByCompany(companyId);
            const ids = new Set(data.ids);
            if (ids.size !== data.ids.length || ids.size !== current.length || !current.every((s) => ids.has(s.id))) {
                return new Result(true, ResultCode.BadRequest, "Send every status id exactly once");
            }

            await this.dao.reorder(data.ids);
            return new Result(false, ResultCode.Success, "Statuses reordered", await this.dao.listByCompany(companyId));
        } catch (error) {
            return serverError(error);
        }
    }

    async setDefault(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.findInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Status not found");
            }
            await this.dao.setDefault(id, companyId);
            return new Result(false, ResultCode.Success, "Default status updated");
        } catch (error) {
            return serverError(error);
        }
    }

    async getTransitions(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.findInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Status not found");
            }
            const rows = await this.dao.listTransitions(id);
            return new Result(false, ResultCode.Success, "Success in read", rows.map((r) => r.to));
        } catch (error) {
            return serverError(error);
        }
    }

    async setTransitions(user: AuthUser, id: string, data: SetTransitionsDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.findInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Status not found");
            }
            if (data.toStatusIds.includes(id)) {
                return new Result(true, ResultCode.BadRequest, "A status can't transition to itself");
            }
            if (data.toStatusIds.length && !(await this.dao.allInCompany(data.toStatusIds, companyId))) {
                return new Result(true, ResultCode.BadRequest, "Invalid status ids");
            }

            await this.dao.setTransitions(id, data.toStatusIds);
            return new Result(false, ResultCode.Success, "Transitions updated");
        } catch (error) {
            return serverError(error);
        }
    }
}