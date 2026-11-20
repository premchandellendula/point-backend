import z, { email } from "zod";

export const createInvitationSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    role: z.enum(["ADMIN", "EMPLOYEE"])
}).strict();

export const acceptInviteSchema = z.object({
    token: z.string().trim().min(20).max(200),
    fullName: z.string().trim().min(3).max(100),
    password: z.string().min(8).max(64),
    avatarUrl: z.url().optional(),
    jobTitle: z.string().trim().max(100).optional()
}).strict();

export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;
export type AcceptInviteDto = z.infer<typeof acceptInviteSchema>;