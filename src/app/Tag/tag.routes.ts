import { Router } from "express";
import type { TagController } from "./tag.controller.js";
import { ro } from "zod/locales";
import { requireRole } from "../../shared/middleware/auth.js";

export function createTagRouter(controller: TagController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");

    router.post("/", anyUser, controller.create);
    router.get("/", anyUser, controller.list);
    router.patch("/:id", anyUser, controller.update);
    router.delete("/:id", requireRole("ADMIN"), controller.remove);

    return router;
}