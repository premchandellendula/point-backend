import type { Request, Response } from "express";
import type { TaskService } from "./task.service.js";
import { changeStatusSchema, createTaskSchema, idParam, listTasksQuerySchema, updateTaskSchema } from "./task.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class TaskController {
    constructor(private readonly service: TaskService) {}

    create = async (req: Request, res: Response) => {
        const projectId = idParam.safeParse(req.params.projectId);
        const body = createTaskSchema.safeParse(req.body);
        if(!projectId.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", projectId.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        if(!body.success){
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.create(req.user!, projectId.data, body.data);
        res.status(result.getStatus()).json(result);
    }

    list = async (req: Request, res: Response) => {
        const projectId = idParam.safeParse(req.params.projectId);
        const query = listTasksQuerySchema.safeParse(req.query);
        if(!projectId.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", projectId.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        if(!query.success){
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", query.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.list(req.user!, projectId.data, query.data);
        res.status(result.getStatus()).json(result);
    };

    get = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if(!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.get(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };

    update = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = updateTaskSchema.safeParse(req.body);
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
    };

    changeStatus = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = changeStatusSchema.safeParse(req.body);
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
        const result = await this.service.changeStatus(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    };
}