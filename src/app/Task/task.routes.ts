import { Router } from "express";
import type { TaskController } from "./task.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";

export function createTaskRouter(controller: TaskController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");

    router.get("/:id", anyUser, controller.get);
    router.patch("/:id", anyUser, controller.update);
    router.patch("/:id/status", anyUser, controller.changeStatus);

    return router;
}