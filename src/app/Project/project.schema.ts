import z from "zod";
import type { Prisma } from "../../generated/prisma/client.js";

export const createProjectSchema = z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(2000).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    tagIds: z.array(z.uuid()).max(20).optional(),
}).strict();

export const updateProjectSchema = z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(2000).nullable(),
    status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]),
    startDate: z.coerce.date().nullable(),
    endDate: z.coerce.date().nullable(),
    tagIds: z.array(z.uuid()).max(20).optional(),
}).partial().strict();

export const addMemberSchema = z.object({
    userId: z.uuid(),
    role: z.enum(["ADMIN", "EMPLOYEE"]).default("EMPLOYEE"),
}).strict();

export const listProjectsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    count: z.coerce.number().int().min(1).max(100).default(10),
});

export const idParam = z.uuid();

export const projectSelect = {
    id: true,
    name: true,
    description: true,
    status: true,
    startDate: true,
    endDate: true,
    createdAt: true,
    updatedAt: true,
    tags: { select: { id: true, name: true, color: true } },
} satisfies Prisma.ProjectSelect;

export const projectDetailSelect = {
    ...projectSelect,
    members: {
        select: {
            role: true,
            joinedAt: true,
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        },
    },
} satisfies Prisma.ProjectSelect;

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
export type AddMemberDto = z.infer<typeof addMemberSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;