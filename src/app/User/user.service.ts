import type { Prisma } from "../../generated/prisma/client.js";
import { generateRefreshToken, hashToken, REFRESH_TTL_MS, signAccessToken } from "../../shared/auth/tokens.js";
import type { AuthUser, Role } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { RefreshTokenDao } from "../auth/refreshToken.dao.js";
import type { UserDao } from "./user.dao.js";
import { userSelect, type ChangeRoleDto, type ListUsersQuery, type LoginDto, type UpdateMeDto } from "./user.schema.js";
import bcrypt from "bcryptjs";

export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    user: { id: string; role: Role };
}

const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
};

export class UserService {
    constructor(
        private readonly userDao: UserDao,
        private readonly refreshTokenDao: RefreshTokenDao
    ) {}

    // async signup(data: CreateUserDto) {
    //     try {
    //         const { password, ...rest } = data;
    //         const hashPassword = await bcrypt.hash(data.password, 12);

    //         const user = await this.userDao.create({ ...rest, password: hashPassword });

    //         return new Result(false, ResultCode.Created, "User signup successful", user.result)
    //     } catch (error) {
    //         console.error(error);
    //         return new Result(true, ResultCode.InternalServerError, "Internal Server Error")
    //     }
    // }

    async login(data: LoginDto): Promise<Result<AuthSession>> {
        const user = await this.userDao.readByEmail(data.email);
        const valid = bcrypt.compare(data.password, user?.password ?? DUMMY_HASH);

        if (!user || !valid) {
            return new Result(true, ResultCode.NotAuthorized, "Invalid email or password");
        }
        if (user.deactivatedAt) {
            return new Result(true, ResultCode.Forbidden, "Account is deactivated");
        }

        const session = await this.issueSession({ id: user.id, role: user.role });

        return new Result(false, ResultCode.Success, "Login successful", session)
    }

    async refresh(rawToken: string | undefined): Promise<Result<AuthSession>> {
        const fail = () => new Result<AuthSession>(true, ResultCode.NotAuthorized, "Invalid or expired session");

        if(!rawToken) return fail();

        const stored = await this.refreshTokenDao.findByHash(hashToken(rawToken));
        if(!stored) return fail();

        if(stored.revokedAt){
            await this.refreshTokenDao.revokeAllForUser(stored.userId);
            return fail();
        }

        if(stored.expiresAt < new Date()) return fail();

        const claimed = await this.refreshTokenDao.revokeIfActive(stored.id);
        if(!claimed){
            await this.refreshTokenDao.revokeAllForUser(stored.userId);
            return fail();
        }

        const user = await this.userDao.read<{ id: string; role: Role, deactivatedAt: Date | null }>(stored.userId, {
            id: true,
            role: true
        })
        if(user.status.error || !user.result || user.result.deactivatedAt) return fail();

        const session = await this.issueSession(user.result);
        return new Result(false, ResultCode.Success, "Session refreshed", session);
    }
    
    async logout(rawToken: string | undefined): Promise<void> {
        if(rawToken) await this.refreshTokenDao.revokeByHash(hashToken(rawToken));
    }

    private async issueSession(
        user: { id: string; role: Role }
    ) {
        const refreshToken = generateRefreshToken();
        await this.refreshTokenDao.create({
            tokenHash: hashToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + REFRESH_TTL_MS)
        })

        return { accessToken: signAccessToken(user), refreshToken, user };
    }
    
    async me(userId: string) {
        const user = await this.userDao.readMe(userId);
        if (!user) {
            return new Result<null>(true, ResultCode.NotAuthorized, "Account not found");
        }

        
        return new Result(false, ResultCode.Success, "Current user", {
            user
        });
    }

    async list(user: AuthUser, q: ListUsersQuery) {
        const companyId = await this.userDao.getCompanyId(user.id);
        if (!companyId) return new Result(true, ResultCode.NotFound, "Company not found");

        const where: Prisma.UserWhereInput = {
            companyId,
            ...(q.role && { role: q.role }),
            ...(!q.includeInactive && { deactivatedAt: null }),
            ...(q.search && {
                OR: [
                    { fullName: { contains: q.search, mode: "insensitive" } },
                    { email: { contains: q.search, mode: "insensitive" } },
                ],
            }),
        };
        return this.userDao.readMany({ page: q.page, count: q.count, field: "fullName", order: "ASC", where, select: userSelect });
    }

    async updateMe(user: AuthUser, data: UpdateMeDto) {
        try {
            const updated = await this.userDao.updateUser(user.id, data);
            return new Result(false, ResultCode.Success, "Profile updated", updated);
        } catch (error) {
            return serverError(error);
        }
    }

    async changeRole(user: AuthUser, id: string, data: ChangeRoleDto) {
        try {
            if(id === user.id) return new Result(true, ResultCode.BadRequest, "You can't change your own role");

            const companyId = await this.userDao.getCompanyId(user.id);
            const target = companyId ? await this.userDao.findInCompany(id, companyId) : null;
            if(!target) return new Result(true, ResultCode.NotFound, "User not found");

            const updated = await this.userDao.updateUser(id, { role: data.role });
            return new Result(false, ResultCode.Success, "Role updated", updated);
        } catch (error) {
            return serverError(error);
        }
    }

    async setActive(user: AuthUser, id: string, active: boolean) {
        try {
            if (id === user.id) return new Result(true, ResultCode.BadRequest, "You can't deactivate yourself");

            const companyId = await this.userDao.getCompanyId(user.id);
            const target = companyId ? await this.userDao.findInCompany(id, companyId) : null;
            if (!target) return new Result(true, ResultCode.NotFound, "User not found");

            const updated = await this.userDao.setActive(id, active);
            return new Result(false, ResultCode.Success, active ? "User activated" : "User deactivated", updated);
        } catch (error) {
            return serverError(error);
        }
    }   
}