import { Router } from "express";
import type { ActivityController } from "./activity.controller.js";

export function createActivityRouter(controller: ActivityController): Router {
    const router = Router();

    return router;
}