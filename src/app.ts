import express, { type Request, type Response } from 'express'
import type { Container } from "./container.js";

export function createApp(container: Container) {
    const app = express();
    app.use(express.json());

    app.get("/health", (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "Point API is running"
        })
    })

    return app;
}