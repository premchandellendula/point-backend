import { Router } from "express";
import type { CompanyController } from "./company.controller.js";

export function createCompanyRouter(controller: CompanyController): Router {
    const router = Router();
    router.post("/", controller.register);

    return router;
}