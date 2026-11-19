import { RefreshTokenDao } from "./app/auth/refreshToken.dao.js";
import { CompanyController } from "./app/Company/company.controller.js";
import { CompanyDao } from "./app/Company/company.dao.js";
import { CompanyService } from "./app/Company/company.service.js";
import { UserController } from "./app/User/user.controller.js";
import { UserDao } from "./app/User/user.dao.js";
import { UserService } from "./app/User/user.service.js";
import type { PrismaClient } from "./generated/prisma/client.js";

export function buildContainer(prisma: PrismaClient) {
    const userDao = new UserDao(prisma);
    const refreshTokenDao = new RefreshTokenDao(prisma);
    const companyDao = new CompanyDao(prisma);

    const userService = new UserService(userDao, refreshTokenDao);
    const companyService = new CompanyService(companyDao);

    const userController = new UserController(userService);
    const companyController = new CompanyController(companyService);

    return { userController, companyController };
}

export type Container = ReturnType<typeof buildContainer>;