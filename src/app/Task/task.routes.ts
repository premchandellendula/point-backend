import { Router } from "express";
import type { TaskController } from "./task.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";
import type { TimeLogController } from "../TimeLog/timeLog.controller.js";

export function createTaskRouter(controller: TaskController, timeLogController: TimeLogController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");

    router.get("/:id", anyUser, controller.get);
    router.patch("/:id", anyUser, controller.update);
    router.patch("/:id/status", anyUser, controller.changeStatus);
    router.post("/:id/timer/start", anyUser, timeLogController.start);
    router.post("/:id/timer/stop", anyUser, timeLogController.stop);
    router.post("/:id/time-logs", anyUser, timeLogController.addManual);
    router.get("/:id/time-logs", anyUser, timeLogController.list);

    return router;
}