// ------------------------------------------------------------
// src/modules/auth/auth.schemas.ts
// ------------------------------------------------------------
import { z } from "zod";


export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(8),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export const passwordResetRequestSchema = z.object({
    email: z.string().email(),
});


export const passwordResetSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(6),
});
