import z from "zod";
import { Role } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";

const token = z.string().trim().min(20).max(200);

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

export type RegisterCompanyDto = z.infer<typeof registerCompanySchema>;

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1).max(72),
});
export type LoginDto = z.infer<typeof loginSchema>;