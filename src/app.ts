import express, { type Request, type Response } from 'express'
import type { Container } from "./container.js";
import { createV1Router } from './app/routes/v1.js';
import { authMiddleware } from './shared/middleware/auth.js';
import cookieParser from "cookie-parser";

export function createApp(container: Container) {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(authMiddleware);

    app.get("/health", (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "Point API is running"
        })
    })
    app.use("/api/v1", createV1Router(container));

    return app;
}