import type { Request, Response } from "express";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { ProjectService } from "./project.service.js";
import { addMemberSchema, createProjectSchema, idParam, listProjectsQuerySchema, updateProjectSchema } from "./project.schema.js";

export class ProjectController {
    constructor(private readonly service: ProjectService) {}

    create = async (req: Request, res: Response) => {
        const parsed = createProjectSchema.safeParse(req.body);
        if(!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.create(req.user!, parsed.data);
        res.status(result.getStatus()).json(result);
    }

    list = async (req: Request, res: Response) => {
        const parsed = listProjectsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.list(req.user!, parsed.data);
        res.status(result.getStatus()).json(result);
    };

    get = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.get(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };

    update = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = updateProjectSchema.safeParse(req.body);
        if(!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return; 
        }
        if(!body.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.update(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    }

    addMember = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = addMemberSchema.safeParse(req.body);
        if(!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return; 
        }
        if(!body.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", body.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.addMember(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    };

    removeMember = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const userId = idParam.safeParse(req.params.userId);
        if(!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return; 
        }

        if (!userId.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", userId.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.removeMember(req.user!, id.data, userId.data);
        res.status(result.getStatus()).json(result);
    };

    members = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        if (!id.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", id.error.issues);
            res.status(r.getStatus()).json(r);
            return; 
        }

        const result = await this.service.members(req.user!, id.data);
        res.status(result.getStatus()).json(result);
    };
}