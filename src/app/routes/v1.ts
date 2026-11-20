import { Router } from "express";
import type { Container } from "../../container.js";
import { createUserRouter } from "../User/user.routes.js";
import { createCompanyRouter } from "../Company/company.routes.js";
import { createInvitationRouter } from "../Invitation/invitation.routes.js";
import { createProjectRouter } from "../Project/project.routes.js";
import { createTaskRouter } from "../Task/task.routes.js";

export function createV1Router(c: Container): Router {
    const router = Router();
    router.use("/users", createUserRouter(c.userController));
    router.use("/companies", createCompanyRouter(c.companyController));
    router.use("/invitations", createInvitationRouter(c.invitationController));
    router.use("/projects", createProjectRouter(c.projectController, c.taskController));
    router.use("/tasks", createTaskRouter(c.taskController));

    return router;
}