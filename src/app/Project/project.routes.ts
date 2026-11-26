
import { Router } from "express";
import type { ProjectController } from "./project.controller.js"
import { requireRole } from "../../shared/middleware/auth.js";
import type { TaskController } from "../Task/task.controller.js";
import type { ActivityController } from "../Activity/activity.controller.js";

export function createProjectRouter(controller: ProjectController, taskController: TaskController, activityController: ActivityController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");
    const admin = requireRole("ADMIN");

    router.post("/", admin, controller.create);
    router.get("/", anyUser, controller.list);
    router.get("/:id", anyUser, controller.get);
    router.patch("/:id", admin, controller.update);
    router.post("/:id/members", admin, controller.addMember);
    router.delete("/:id/members/:userId", admin, controller.removeMember);
    router.post("/:projectId/tasks", anyUser, taskController.create);
    router.get("/:projectId/tasks", anyUser, taskController.list);
    router.get("/:projectId/activity", anyUser, activityController.projectActivity);

    return router;
}