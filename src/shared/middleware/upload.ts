import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { Result, ResultCode } from "../result/result.js";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_BYTES, files: 1 } });

export const uploadSingle = (field: string) => (req: Request, res: Response, next: NextFunction) => {
    upload.single(field)(req, res, (err) => {
        if (!err) return next();
        const tooBig = (err as { code?: string }).code === "LIMIT_FILE_SIZE";
        const r = new Result(true, tooBig ? ResultCode.BadRequest : ResultCode.BadRequest, tooBig ? "File too large (max 10 MB)" : "Invalid upload");
        res.status(r.getStatus()).json(r);
    });
};