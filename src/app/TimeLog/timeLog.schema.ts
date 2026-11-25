import z from "zod";
import type { Prisma } from "../../generated/prisma/client.js";

export const manualLogSchema = z.object({
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date(),
    note: z.string().trim().max(500).optional(),
}).strict().refine((d) => d.endedAt > d.startedAt, { message: "endedaaaaaat must be after startedAt", path: ["endedAt"]})

export const startTimerSchema = z.object({
    note: z.string().trim().max(500).optional(),
}).strict();

export const updateTimeLogSchema = z.object({
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date(),
    note: z.string().trim().max(500).nullable()
}).partial().strict();

export const idParam = z.uuid();

export const timeLogSelect = {
    id: true,
    taskId: true,
    userId: true,
    startedAt: true,
    endedAt: true,
    seconds: true,
    note: true,
    createdAt: true,
    user: { select: { id: true, fullName: true, avatarUrl: true } },
} satisfies Prisma.TimeLogSelect;

export type ManualLogDto = z.infer<typeof manualLogSchema>;
export type StartTimerDto = z.infer<typeof startTimerSchema>;
export type UpdateTimeLogDto = z.infer<typeof updateTimeLogSchema>;