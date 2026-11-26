import type { Request, Response } from "express";
import { idParam, listActivityQuerySchema } from "./activity.schema.js";
import type { ActivityService } from "./activity.service.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class ActivityController {
    constructor(private readonly service: ActivityService) {}

    projectActivity = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.projectId);
        const query = listActivityQuerySchema.safeParse(req.query);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        if (!query.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", query.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.projectActivity(req.user!, id.data, query.data);
        res.status(result.getStatus()).json(result);
    };

    taskActivity = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const query = listActivityQuerySchema.safeParse(req.query);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        if (!query.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", query.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.taskActivity(req.user!, id.data, query.data);
        res.status(result.getStatus()).json(result);
    };

    taskHistory = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.taskHistory(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };
}