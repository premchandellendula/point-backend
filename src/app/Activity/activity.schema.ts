import z from "zod";
import type { Prisma } from "../../generated/prisma/client.js";

export const listActivityQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    count: z.coerce.number().int().min(1).max(100).default(20)
})

export const idParam = z.uuid();

const statusPick = { select: { id: true, name: true, category: true, color: true } }
const userPick = { select: { id: true, fullName: true, avatarUrl: true } }

export const activitySelect = {
    id: true,
    projectId: true,
    taskId: true,
    action: true,
    metadata: true,
    createdAt: true,
    actor: userPick,
    task: { select: { id: true, title: true, type: true } },
} satisfies Prisma.ActivitySelect;

export const historySelect = {
    id: true,
    changedAt: true,
    fromStatus: statusPick,
    toStatus: statusPick,
    changedBy: userPick
} satisfies Prisma.TaskStatusHistorySelect;

export type ListActivityQuery = z.infer<typeof listActivityQuerySchema>;