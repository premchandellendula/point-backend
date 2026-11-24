import type { Request, Response } from "express";
import { Result, ResultCode } from "../../shared/result/result.js";
import { createStatusSchema, idParam, reorderSchema, setTransitionsSchema, updateStatusSchema } from "./workflowStatus.schema.js";
import type { WorkflowStatusService } from "./workflowStatus.service.js";

export class WorkflowStatusController {
    constructor(private readonly service: WorkflowStatusService) {}

    create = async (req: Request, res: Response) => {
        const body = createStatusSchema.safeParse(req.body);
        if (!body.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.create(req.user!, body.data);
        res.status(result.getStatus()).json(result);
    };

    list = async (req: Request, res: Response) => {
        const result = await this.service.list(req.user!);
        res.status(result.getStatus()).json(result);
    };

    update = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = updateStatusSchema.safeParse(req.body);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        if (!body.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.update(req.user!, id.data, body.data);
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

    reorder = async (req: Request, res: Response) => {
        const body = reorderSchema.safeParse(req.body);
        if (!body.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.reorder(req.user!, body.data);
        res.status(result.getStatus()).json(result);
    };

    setDefault = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.setDefault(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };

    getTransitions = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.getTransitions(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };

    setTransitions = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = setTransitionsSchema.safeParse(req.body);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        if (!body.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.setTransitions(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    };
}