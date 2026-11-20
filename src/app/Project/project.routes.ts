
import { Router } from "express";
import type { ProjectController } from "./project.controller.js"
import { requireRole } from "../../shared/middleware/auth.js";

export function createProjectRouter(controller: ProjectController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");
    const admin = requireRole("ADMIN");

    router.post("/", admin, controller.create);
    router.post("/", anyUser, controller.list);
    router.post("/:id", anyUser, controller.get);
    router.post("/:id", admin, controller.update);
    router.post("/:id/members", admin, controller.addMember);
    router.post("/:id/members/:userId", admin, controller.removeMember);
    return router;
}