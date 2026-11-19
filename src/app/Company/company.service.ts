import bcrypt from "bcryptjs";
import type { CompanyDao } from "./company.dao.js";
import type { RegisterCompanyDto } from "./company.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class CompanyService {
    constructor(private readonly dao: CompanyDao) {}

    async registerCompany(data: RegisterCompanyDto) {
        try {
            const { companyName, password, fullName, email } = data;
            const passwordHash = await bcrypt.hash(password, 12);

            const result = await this.dao.createWithAdmin(companyName, { fullName, email, passwordHash });
            return new Result(false, ResultCode.Created, "Company registered", result);
        } catch (error) {
            if ((error as { code?: string }).code === "P2002") {
                return new Result(true, ResultCode.Conflict, "Email already in use");
            }
            console.error(error);
            return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
        }
    }
}