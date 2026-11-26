import type { Request, Response } from "express";
import { idParam } from "./attachment.schema.js";
import type { AttachmentService } from "./attachment.service.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class AttachmentController {
    constructor(private readonly service: AttachmentService) {}

    upload = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.upload(req.user!, id.data, req.file);
        res.status(result.getStatus()).json(result);
    };

    list = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.list(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };

    download = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.downloadUrl(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };

    remove = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.remove(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };
}