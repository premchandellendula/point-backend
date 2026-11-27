import { Router } from "express";
import type { TeamController } from "./team.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";

export function createTeamRouter(controller: TeamController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");
    const admin = requireRole("ADMIN");

    router.post("/", admin, controller.create);
    router.get("/", anyUser, controller.list);
    router.get("/:id", anyUser, controller.get);
    router.patch("/:id", admin, controller.update);
    router.delete("/:id", admin, controller.remove);
    router.post("/:id/members", admin, controller.addMember);
    router.delete("/:id/members/:userId", admin, controller.removeMember);

    return router;
}