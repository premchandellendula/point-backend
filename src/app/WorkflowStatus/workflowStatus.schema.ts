import z from "zod";
import { StatusCategory } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";

const category = z.enum(StatusCategory);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const createStatusSchema = z.object({
    name: z.string().trim().min(1).max(50),
    category,
    color: color.optional()
}).strict();

export const updateStatusSchema = z.object({
    name: z.string().trim().min(1).max(50),
    category,
    color: color.nullable()
}).partial().strict();

export const reorderSchema = z.object({
    ids: z.array(z.uuid()).min(1).max(100),
}).strict();

export const setTransitionsSchema = z.object({
    toStatusIds: z.array(z.uuid()).max(100)
}).strict();

export const idParam = z.uuid();

export const statusSelect = {
    id: true,
    name: true,
    color: true,
    position: true,
    isDefault: true,
} satisfies Prisma.WorkflowStatusSelect;

export type CreateStatusDto = z.infer<typeof createStatusSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
export type ReorderDto = z.infer<typeof reorderSchema>;
export type SetTransitionsDto = z.infer<typeof setTransitionsSchema>;