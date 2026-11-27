import z from "zod";
import type { Prisma } from "../../generated/prisma/client.js";

export const createTeamSchema = z.object({
    name: z.string().trim().min(2).max(100)
}).strict();

export const updateTeamSchema = createTeamSchema;

export const addTeamMemberSchema = z.object({
    userId: z.uuid()
}).strict();

export const idParam = z.uuid();

export const teamSelect = {
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { users: true } }
} satisfies Prisma.TeamSelect;

export const teamDetailSelect = {
    ...teamSelect,
    users: {
        where: { deactivatedAt: null },
        select: { id: true, fullName: true, email: true, avatarUrl: true, jobTitle: true, role: true },
        orderBy: { fullName: "asc" },
    },
} satisfies Prisma.TeamSelect;

export type CreateTeamDto = z.infer<typeof createTeamSchema>;
export type UpdateTeamDto = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberDto = z.infer<typeof addTeamMemberSchema>;