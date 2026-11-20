import z from "zod";
import { BillingType, Priority, TaskType } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";

const type = z.enum(TaskType);
const priority = z.enum(Priority);
const billingType = z.enum(BillingType);

export const createTaskSchema = z.object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(10000).optional(),
    type: type.default("TASK"),
    priority: priority.default("MEDIUM"),
    billingType: billingType.default("NON_BILLABLE"),
    requestDate: z.coerce.date().optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    assigneeId: z.uuid().optional(),
    parentId: z.uuid().optional(),
    statusId: z.uuid().optional()
}).strict();

export const updateTaskSchema = z.object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(10000).nullable(),
    type,
    priority,
    billingType,
    requestDate: z.coerce.date().nullable(),
    startDate: z.coerce.date().nullable(),
    dueDate: z.coerce.date().nullable(),
    assigneeId: z.uuid().nullable(),
}).partial().strict();

export const changeStatusSchema = z.object({
    statusId: z.uuid()
}).strict();

export const listTasksQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    count: z.coerce.number().int().min(1).max(100).default(20),
    type: type.optional(),
    statusId: z.uuid().optional(),
    assigneeId: z.uuid().optional(),
    priority: priority.optional(),
    parentId: z.uuid().optional(),
    search: z.string().trim().max(100).optional()
});

export const idParam = z.uuid();

export const taskSelect = {
    id: true,
    title: true,
    description: true,
    type: true,
    priority: true,
    billingType: true,
    requestDate: true,
    startDate: true,
    dueDate: true,
    projectId: true,
    parentId: true,
    createdById: true,
    createdAt: true,
    updatedAt: true,
    status: { select: { id: true, name: true, category: true, color: true } },
    assignee: { select: { id: true, fullName: true, avatarUrl: true } },
} satisfies Prisma.TaskSelect;

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type ChangeStatusDto = z.infer<typeof changeStatusSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;