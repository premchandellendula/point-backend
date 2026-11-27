import type { Request, Response } from "express";
import { addTeamMemberSchema, createTeamSchema, idParam, updateTeamSchema } from "./team.schema.js";
import type { TeamService } from "./team.service.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class TeamController {
    constructor(private readonly service: TeamService) {}

    create = async (req: Request, res: Response) => {
        const body = createTeamSchema.safeParse(req.body);
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
        const body = updateTeamSchema.safeParse(req.body);
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

    addMember = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const body = addTeamMemberSchema.safeParse(req.body);
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

        const result = await this.service.addMember(req.user!, id.data, body.data);
        res.status(result.getStatus()).json(result);
    };

    removeMember = async (req: Request, res: Response) => {
        const id = idParam.safeParse(req.params.id);
        const userId = idParam.safeParse(req.params.userId);
        if (!id.success) {
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
}