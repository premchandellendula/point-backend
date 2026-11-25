
import { Router } from "express";
import type { TimeLogController } from "./timeLog.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";

export function createTimeLogRouter(controller: TimeLogController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");

    router.get("/running", anyUser, controller.running);
    router.patch("/:id", anyUser, controller.update);
    router.delete("/:id", anyUser, controller.remove);

    return router;
}