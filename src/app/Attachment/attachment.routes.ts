import { Router } from "express";
import type { AttachmentController } from "./attachment.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";

export function createAttachmentRouter(controller: AttachmentController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");

    router.get("/:id/download", anyUser, controller.download);
    router.delete("/:id", anyUser, controller.remove);

    return router;
}