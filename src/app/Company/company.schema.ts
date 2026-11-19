import z from "zod";

export const registerCompanySchema = z.object({
    companyName: z.string().trim().min(2).max(100),
    fullName: z.string().trim().min(3).max(100),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8).max(64),
}).strict();

export type RegisterCompanyDto = z.infer<typeof registerCompanySchema>;