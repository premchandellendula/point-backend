import z from "zod";
import { Role, type Prisma } from "../../generated/prisma/client.js";

export const registerCompanySchema = z.object({
    companyName: z.string().trim().min(2).max(100),
    fullName: z.string().trim().min(3).max(100),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8).max(64)
}).strict();

export const acceptInviteSchema = z.object({
    token: z.string().trim().min(20).max(200),
    fullName: z.string().trim().min(3).max(100),
    password: z.string().min(8).max(64),
    avatarUrl: z.url().optional(),
    jobTitle: z.string().trim().max(100).optional(),
}).strict();

export const updateUserSchema = z
    .object({
        fullName: z.string().trim().min(3).max(100),
        avatarUrl: z.url().nullable(),
        jobTitle: z.string().trim().max(100).nullable(),
        teamId: z.uuid().nullable(),
    })
    .partial()
    .strict();

export const userSelect = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    avatarUrl: true,
    jobTitle: true,
    emailVerifiedAt: true,
    teamId: true,
    companyId: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;

export const idParam = z.uuid();

export const updateMeSchema = z.object({
    fullName: z.string().trim().min(3).max(100),
    avatarUrl: z.url().nullable(),
    jobTitle: z.string().trim().max(100).nullable()
}).partial().strict();

export const changeRoleSchema = z.object({
    role: z.enum(Role)
});

export const listUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    count: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    role: z.enum(Role).optional(),
    includeInactive: z.enum(["true", "false"]).default("false").transform((v) => v === "true")
});

export type RegisterCompanyDto = z.infer<typeof registerCompanySchema>;

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1).max(72),
});
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateMeDto = z.infer<typeof updateMeSchema>;
export type ChangeRoleDto = z.infer<typeof changeRoleSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;