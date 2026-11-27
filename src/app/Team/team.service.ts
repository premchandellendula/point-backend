import type { AuthUser } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { TeamDao } from "./team.dao.js";
import type { AddTeamMemberDto, CreateTeamDto, UpdateTeamDto } from "./team.schema.js";

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
};
const isDuplicate = (e: unknown) => (e as { code?: string }).code === "P2002";

export class TeamService {
    constructor(private readonly dao: TeamDao){}

    async create(user: AuthUser, data: CreateTeamDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if(!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

            const team = await this.dao.createTeam({ ...data, companyId });
            return new Result(false, ResultCode.Created, "Team created", team);
        } catch (error) {
            if(isDuplicate(error)) return new Result(true, ResultCode.Conflict, "Team already exists");
            return serverError(error);
        }
    }

    async list(user: AuthUser) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId) return new Result(true, ResultCode.NotFound, "Company not found");
            
            const teams = await this.dao.listByCompany(companyId); 
            return new Result(false, ResultCode.Success, "Success in read", teams);
        } catch (error) {
            return serverError(error);
        }
    }

    async get(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            const team = companyId ? await this.dao.findDetail(id, companyId) : null;
            if (!team) return new Result(true, ResultCode.NotFound, "Team not found");

            return new Result(false, ResultCode.Success, "Success in read", team);
        } catch (error) {
            return serverError(error);
        }
    }

    async update(user: AuthUser, id: string, data: UpdateTeamDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.existsInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Team not found");
            }
            const team = await this.dao.updateTeam(id, data);
            return new Result(false, ResultCode.Success, "Team updated", team);
        } catch (error) {
            if (isDuplicate(error)) return new Result(true, ResultCode.Conflict, "Team already exists");
            return serverError(error);
        }
    }

    async remove(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.existsInCompany(id, companyId))) {
                return new Result(true, ResultCode.NotFound, "Team not found");
            }
            await this.dao.deleteTeam(id);
            return new Result(false, ResultCode.Success, "Team deleted");
        } catch (error) {
            return serverError(error);
        }
    }

    async addMember(user: AuthUser, teamId: string, data: AddTeamMemberDto) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if(!companyId || !(await this.dao.existsInCompany(teamId, companyId))){
                return new Result(true, ResultCode.NotFound, "Team not found");
            }

            if(!(await this.dao.activeUserInCompany(data.userId, companyId))){
                return new Result(true, ResultCode.NotFound, "User not found in your company")
            }

            const member = await this.dao.assignUser(data.userId, teamId);
            return new Result(false, ResultCode.Success, "User added to team", member);
        } catch (error) {
            return serverError(error);
        }
    }

    async removeMember(user: AuthUser, teamId: string, userId: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            if (!companyId || !(await this.dao.existsInCompany(teamId, companyId))) {
                return new Result(true, ResultCode.NotFound, "Team not found");
            }
            const removed = await this.dao.removeUser(userId, teamId);
            if (removed === 0) return new Result(true, ResultCode.NotFound, "User is not in this team");

            return new Result(false, ResultCode.Success, "User removed from team");
        } catch (error) {
            return serverError(error);
        }
    }
}