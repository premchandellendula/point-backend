import { Router } from "express";
import type { Container } from "../../container.js";
import { createUserRouter } from "../User/user.routes.js";
import { createCompanyRouter } from "../Company/company.routes.js";
import { createInvitationRouter } from "../Invitation/invitation.routes.js";
import { createProjectRouter } from "../Project/project.routes.js";
import { createTaskRouter } from "../Task/task.routes.js";
import { createTagRouter } from "../Tag/tag.routes.js";
import { createStatusRouter } from "../WorkflowStatus/workflowStatus.routes.js";
import { createTimeLogRouter } from "../TimeLog/timeLog.routes.js";

export function createV1Router(c: Container): Router {
    const router = Router();
    router.use("/users", createUserRouter(c.userController));
    router.use("/companies", createCompanyRouter(c.companyController));
    router.use("/invitations", createInvitationRouter(c.invitationController));
    router.use("/projects", createProjectRouter(c.projectController, c.taskController));
    router.use("/tasks", createTaskRouter(c.taskController, c.timeLogController));
    router.use("/tags", createTagRouter(c.tagController))
    router.use("/statuses", createStatusRouter(c.workflowStatusController));
    router.use("/time-logs", createTimeLogRouter(c.timeLogController));

    return router;
}