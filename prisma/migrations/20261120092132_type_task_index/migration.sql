-- DropIndex
DROP INDEX "Task_projectId_statusId_idx";

-- CreateIndex
CREATE INDEX "Task_projectId_type_statusId_idx" ON "Task"("projectId", "type", "statusId");
