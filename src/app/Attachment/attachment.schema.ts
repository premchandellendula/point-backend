import z from "zod";
import type { Prisma } from "../../generated/prisma/client.js";

export const idParam = z.uuid();

export const attachmentSelect = {
    id: true,
    taskId: true,
    fileName: true,
    mimeType: true,
    size: true,
    createdAt: true,
    uploadedBy: { select: { id: true, fullName: true, avatarUrl: true } }
} satisfies Prisma.AttachmentSelect;