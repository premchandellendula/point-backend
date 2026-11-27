import { Router } from "express";
import type { UserController } from "./user.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";

export function createUserRouter(controller: UserController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");
    const admin = requireRole("ADMIN");

    router.post("/login", controller.login);
    router.post("/refresh", controller.refresh);
    router.get("/me", anyUser, controller.me);
    router.get("/", anyUser, controller.list);
    router.patch("/me", anyUser, controller.updateMe);
    router.patch("/:id/role", admin, controller.changeRole);
    router.patch("/:id/deactivate", admin, controller.deactivate);
    router.patch("/:id/activate", admin, controller.activate);

    return router;
}