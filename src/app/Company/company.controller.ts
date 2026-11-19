import type { Request, Response } from "express";
import type { CompanyService } from "./company.service.js";
import { registerCompanySchema } from "./company.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class CompanyController {
    constructor(private readonly service: CompanyService) {}

    register = async (req: Request, res: Response) => {
        const parsed = registerCompanySchema.safeParse(req.body);

        if(!parsed.success){
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.registerCompany(parsed.data);
        res.status(result.getStatus()).json(result);
    }
}