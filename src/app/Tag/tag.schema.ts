import z from "zod";
import type { Prisma } from "../../generated/prisma/client.js";

export const createTagSchema = z.object({
    name: z.string().trim().min(1).max(30),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
}).strict();

export const updateTagSchema = z.object({
    name: z.string().trim().min(1).max(30),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
}).partial().strict();

export const idParam = z.uuid();

export const tagSelect = {
    id: true,
    name: true,
    color: true,
} satisfies Prisma.TagSelect;

export type CreateTagDto = z.infer<typeof createTagSchema>;
export type UpdateTagDto = z.infer<typeof updateTagSchema>;