import { Router } from "express";
import type { UserController } from "./user.controller.js";

export function createUserRouter(controller: UserController): Router {
    const router = Router();

    router.post("/login", controller.login);
    router.post("/refresh", controller.refresh);
    router.post("/me", controller.me);

    return router;
}