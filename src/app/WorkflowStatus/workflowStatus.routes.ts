import { Router } from "express";
import { requireRole } from "../../shared/middleware/auth.js";
import type { WorkflowStatusController } from "./workflowStatus.controller.js";

export function createStatusRouter(controller: WorkflowStatusController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");
    const admin = requireRole("ADMIN");

    router.get("/", anyUser, controller.list);
    router.post("/", admin, controller.create);
    router.patch("/reorder", admin, controller.reorder); // must come before "/:id"
    router.patch("/:id", admin, controller.update);
    router.delete("/:id", admin, controller.remove);
    router.patch("/:id/default", admin, controller.setDefault);
    router.get("/:id/transitions", anyUser, controller.getTransitions);
    router.put("/:id/transitions", admin, controller.setTransitions);

    return router;
}