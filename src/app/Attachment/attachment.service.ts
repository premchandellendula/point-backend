import type { Prisma } from "../../generated/prisma/client.js";
import type { AuthUser } from "../../shared/middleware/auth.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import { UPLOAD_RULES, type FileUploader } from "../../shared/storage/uploader.js";
import type { AttachmentDao } from "./attachment.dao.js";

const serverError = (error: unknown) => {
    console.error(error);
    return new Result(true, ResultCode.InternalServerError, "Internal Server Error");
}

const safeName = (name: string) => name.replace(/[^\w.\-]+/g, "_").slice(-100);
const BUCKET = UPLOAD_RULES.attachment.bucket;

export class AttachmentService {
    constructor(
        private readonly dao: AttachmentDao,
        private readonly uploader: FileUploader
    ) {}

    private scope(user: AuthUser, companyId: string): Prisma.ProjectWhereInput {
        return user.role === "ADMIN"
            ? { companyId }
            : { companyId, members: { some: { userId: user.id } } };
    }

    async upload(user: AuthUser, taskId: string, file: Express.Multer.File | undefined){
        let path: string | null = null;
        try {
            if(!file) return new Result(true, ResultCode.BadRequest, "File is required (field name: file");

            const companyId = await this.dao.getCompanyId(user.id);
            const task = companyId ? await this.dao.findTaskScoped(taskId, this.scope(user, companyId)) : null;
            if (!companyId || !task) return new Result(true, ResultCode.NotFound, "Task not found");

            const up = await this.uploader.upload(file, UPLOAD_RULES.attachment, `${companyId}/${taskId}`);
            if (up.status.error || !up.result) return up;
            path = up.result.key;

            const row = await this.dao.createWithActivity(
                {
                    taskId,
                    uploadedById: user.id,
                    fileName: file.originalname,
                    fileUrl: path,
                    mimeType: up.result.contentType,
                    size: up.result.size,
                },
                task.projectId,
            );
            return new Result(false, ResultCode.Created, "File uploaded", row);
        } catch (error) {
            if (path) await this.uploader.discard(BUCKET, path);
            return serverError(error);
        }
    }

    async list(user: AuthUser, taskId: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            const task = companyId ? await this.dao.findTaskScoped(taskId, this.scope(user, companyId)) : null;
            if (!task) return new Result(true, ResultCode.NotFound, "Task not found");

            const tasks = await this.dao.listByTask(taskId);
            return new Result(false, ResultCode.Success, "Success in read", tasks);
        } catch (error) {
            return serverError(error);
        }
    }

    async downloadUrl(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            const att = companyId ? await this.dao.findScoped(id, this.scope(user, companyId)) : null;
            if (!att) return new Result(true, ResultCode.NotFound, "Attachment not found");

            const url = await this.uploader.getSignedUrl(BUCKET, att.fileUrl, 600, att.fileName);
            return new Result(false, ResultCode.Success, "Success in read", { url, expiresInSeconds: 600 });
        } catch (error) {
            return serverError(error);
        }
    }

    async remove(user: AuthUser, id: string) {
        try {
            const companyId = await this.dao.getCompanyId(user.id);
            const att = companyId ? await this.dao.findScoped(id, this.scope(user, companyId)) : null;
            if (!att) return new Result(true, ResultCode.NotFound, "Attachment not found");

            if (att.uploadedById !== user.id && user.role !== "ADMIN") {
                return new Result(true, ResultCode.Forbidden, "Forbidden");
            }

            await this.dao.deleteWithActivity(id, att.task.projectId, att.task.id, user.id, att.fileName);
            await this.uploader.discard(BUCKET, att.fileUrl);

            return new Result(false, ResultCode.Success, "Attachment deleted");
        } catch (error) {
            return serverError(error);
        }
    }
}