import type { Request, Response } from "express";
import type { InvitationService } from "./invitation.service.js";
import { acceptInviteSchema, createInvitationSchema } from "./invitation.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class InvitationController {
    constructor(private readonly service: InvitationService) {}

    create = async (req: Request, res: Response) => {
        const parsed = createInvitationSchema.safeParse(req.body);
        if(!parsed.success){
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.create(req.user!.id, parsed.data);
        res.status(result.getStatus()).json(result);
    }

    accept = async (req: Request, res: Response) => {
        const parsed = acceptInviteSchema.safeParse(req.body);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.accept(parsed.data);
        res.status(result.getStatus()).json(result);
    };
}