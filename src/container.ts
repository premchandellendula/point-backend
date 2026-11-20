import { RefreshTokenDao } from "./app/auth/refreshToken.dao.js";
import { CompanyController } from "./app/Company/company.controller.js";
import { CompanyDao } from "./app/Company/company.dao.js";
import { CompanyService } from "./app/Company/company.service.js";
import { InvitationController } from "./app/Invitation/invitation.controller.js";
import { InvitationDao } from "./app/Invitation/invitation.dao.js";
import { InvitationService } from "./app/Invitation/invitation.service.js";
import { ProjectController } from "./app/Project/project.controller.js";
import { ProjectDao } from "./app/Project/project.dao.js";
import { ProjectService } from "./app/Project/project.service.js";
import { UserController } from "./app/User/user.controller.js";
import { UserDao } from "./app/User/user.dao.js";
import { UserService } from "./app/User/user.service.js";
import type { PrismaClient } from "./generated/prisma/client.js";

export function buildContainer(prisma: PrismaClient) {
    const userDao = new UserDao(prisma);
    const refreshTokenDao = new RefreshTokenDao(prisma);
    const companyDao = new CompanyDao(prisma);
    const invitationDao = new InvitationDao(prisma);
    const projectDao = new ProjectDao(prisma);

    const userService = new UserService(userDao, refreshTokenDao);
    const companyService = new CompanyService(companyDao);
    const invitationService = new InvitationService(invitationDao);
    const projectService = new ProjectService(projectDao);

    const userController = new UserController(userService);
    const companyController = new CompanyController(companyService);
    const invitationController = new InvitationController(invitationService);
    const projectController = new ProjectController(projectService);

    return { userController, companyController, invitationController, projectController };
}

export type Container = ReturnType<typeof buildContainer>;