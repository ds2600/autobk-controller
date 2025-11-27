// ------------------------------------------------------------
// src/modules/users/users.schemas.ts
// ------------------------------------------------------------
import { z } from "zod";
import { ROLES } from "../../config/constants";


export const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().optional(),
    role: z.enum([ROLES.ADMIN, ROLES.USER, ROLES.BASIC]),
    isActive: z.boolean().optional(),
    isDailyReportEnabled: z.boolean().optional(),
});


export const updateUserSchema = z.object({
    email: z.string().email().optional(),
    displayName: z.string().optional(),
    role: z.enum([ROLES.ADMIN, ROLES.USER, ROLES.BASIC]).optional(),
    isActive: z.boolean().optional(),
    isDailyReportEnabled: z.boolean().optional(),
});

export const forcePasswordResetSchema = z.object({
    require: z.boolean(),
});

export type ForcePasswordResetInput = z.infer<typeof forcePasswordResetSchema>;
