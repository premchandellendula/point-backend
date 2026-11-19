import { generateRefreshToken, hashToken, REFRESH_TTL_MS, signAccessToken } from "../../shared/auth/tokens.js";
import type { Role } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { RefreshTokenDao } from "../auth/refreshToken.dao.js";
import type { UserDao } from "./user.dao.js";
import type { LoginDto } from "./user.schema.js";
import bcrypt from "bcryptjs";

export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    user: { id: string; role: Role };
}

const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

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

        const user = await this.userDao.read<{ id: string; role: Role }>(stored.userId, {
            id: true,
            role: true
        })
        if(user.status.error || !user.result) return fail();

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
}