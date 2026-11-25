import type { Request, Response } from "express";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { TimeLogService } from "./timeLog.service.js";
import { idParam, manualLogSchema, startTimerSchema, updateTimeLogSchema } from "./timeLog.schema.js";

const badRequest = (res: Response, issues: unknown) => {
    const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", issues);
    res.status(r.getStatus()).json(r);
};

export class TimeLogController {
    constructor(private readonly service: TimeLogService) {}

    start = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = startTimerSchema.safeParse(req.body ?? {});
        if (!id.success) return badRequest(res, id.error.issues);
        if (!body.success) return badRequest(res, body.error.issues);

        const result = await this.service.start(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    };

    stop = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) return badRequest(res, id.error.issues);

        const result = await this.service.stop(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };

    running = async (req: Request, res: Response) => {
        const result = await this.service.running(req.user!);
        res.status(result.getStatus()).json(result);
    };

    addManual = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = manualLogSchema.safeParse(req.body);
        if (!id.success) return badRequest(res, id.error.issues);
        if (!body.success) return badRequest(res, body.error.issues);

        const result = await this.service.addManual(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    };

    list = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) return badRequest(res, id.error.issues);

        const result = await this.service.list(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };

    update = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = updateTimeLogSchema.safeParse(req.body);
        if (!id.success) return badRequest(res, id.error.issues);
        if (!body.success) return badRequest(res, body.error.issues);

        const result = await this.service.update(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    };

    remove = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) return badRequest(res, id.error.issues);

        const result = await this.service.remove(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };
}