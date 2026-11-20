import { createHash, randomBytes } from "node:crypto";
import type { InvitationDao } from "./invitation.dao.js";
import type { AcceptInviteDto, CreateInvitationDto } from "./invitation.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import bcrypt from "bcryptjs";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export class InvitationService {
    constructor(private readonly dao: InvitationDao) {}

    async create(inviterId: string, data: CreateInvitationDto) {
        try {
            const companyId = await this.dao.getCompanyId(inviterId);
            if(!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

            if(await this.dao.emailTaken(data.email)){
                return new Result(true, ResultCode.Conflict, "User with this email already exists");
            }
                
            const token = randomBytes(32).toString("hex");
            const invitation = await this.dao.createReplacingPending({
                email: data.email,
                role: data.role,
                token: sha256(token),
                expiresAt: new Date(Date.now() + INVITE_TTL_MS),
                companyId,
                invitedById: inviterId
            });
            return new Result(false, ResultCode.Created, "Invitation created", { ...invitation, token });
        } catch (error) {
            console.error(error);
            return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
        }
    }

    async accept(data: AcceptInviteDto) {
        try {
            const { token, password, ...profile } = data;

            const inv = await this.dao.findByTokenHash(sha256(token));
            if(!inv || inv.status !== "PENDING" || inv.expiresAt < new Date()) {
                return new Result(true, ResultCode.BadRequest, "Invalid or expired invitation");
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const user = await this.dao.acceptWithUser(inv, { ...profile, password: passwordHash });

            return new Result(false, ResultCode.Created, "Signup successful", user);
        } catch (error) {
            const e = error as { code?: string; message?: string };
            if(e.code === "P2002") return new Result(true, ResultCode.Conflict, "Email already in user");
            if(e.message === "INVITE_NOT_PENDING"){
                return new Result(true, ResultCode.BadRequest, "Invalid or expired invitation")
            }
            console.error(error);
            return new Result(true, ResultCode.InternalServerError, "Internal Server Error")
        }
    }
}