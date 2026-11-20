import { Router } from "express";
import type { InvitationController } from "./invitation.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";

export function createInvitationRouter(contoller: InvitationController): Router {
    const router = Router();

    router.post("/", requireRole("ADMIN"), contoller.create);
    router.post("/accept", contoller.accept);

    return router;
}