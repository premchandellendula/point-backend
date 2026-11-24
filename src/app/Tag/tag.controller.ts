import type { Request, Response } from "express";
import type { TagService } from "./tag.service.js";
import { createTagSchema, idParam, updateTagSchema } from "./tag.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class TagController {
    constructor(private readonly service: TagService) {}

    create = async (req: Request, res: Response) => {
        const body = createTagSchema.safeParse(req.body);
        if(!body.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.create(req.user!, body.data);
        res.status(result.getStatus()).json(result);
    }

    list = async (req: Request, res: Response) => {
        const result = await this.service.list(req.user!);
        res.status(result.getStatus()).json(result);
    }

    update = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = updateTagSchema.safeParse(req.body);

        if(!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        if(!body.success){
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.update(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    }

    remove = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if(!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.remove(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    }
}