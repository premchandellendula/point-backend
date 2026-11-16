import type { PrismaClient } from "./generated/prisma/client.js";

export function buildContainer(prisma: PrismaClient) {

}

export type Container = ReturnType<typeof buildContainer>;