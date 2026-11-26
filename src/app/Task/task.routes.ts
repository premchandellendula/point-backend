import { Router } from "express";
import type { TaskController } from "./task.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";
import type { TimeLogController } from "../TimeLog/timeLog.controller.js";
import type { AttachmentController } from "../Attachment/attachment.controller.js";
import { uploadSingle } from "../../shared/middleware/upload.js";

export function createTaskRouter(controller: TaskController, timeLogController: TimeLogController, attachmentController: AttachmentController): Router {
    const router = Router();
    const anyUser = requireRole("ADMIN", "EMPLOYEE", "PROJECT_OWNER");

    router.get("/:id", anyUser, controller.get);
    router.patch("/:id", anyUser, controller.update);
    router.patch("/:id/status", anyUser, controller.changeStatus);
    router.post("/:id/timer/start", anyUser, timeLogController.start);
    router.post("/:id/timer/stop", anyUser, timeLogController.stop);
    router.post("/:id/time-logs", anyUser, timeLogController.addManual);
    router.get("/:id/time-logs", anyUser, timeLogController.list);
    router.post("/:id/attachments", anyUser, uploadSingle("file"), attachmentController.upload);
    router.get("/:id/attachments", anyUser, attachmentController.list);

    return router;
}