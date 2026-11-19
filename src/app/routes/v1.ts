import { Router } from "express";
import type { Container } from "../../container.js";
import { createUserRouter } from "../User/user.routes.js";
import { createCompanyRouter } from "../Company/company.routes.js";

export function createV1Router(c: Container): Router {
    const router = Router();
    router.use("/users", createUserRouter(c.userController));
    router.use("/companies", createCompanyRouter(c.companyController));

    return router;
}