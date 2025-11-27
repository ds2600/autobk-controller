// src/config/env.ts
import 'dotenv/config';
import { z } from "zod";

// ------------------------------------------------------------
// Environment Variable Schema
// ------------------------------------------------------------
const EnvSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    REDIS_ENABLE: z.coerce.boolean().default(false),
    REDIS_URL: z.string().optional(),
    CACHE_TTL_DEVICES_SUMMARY: z.coerce.number().default(300),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
    JWT_TTL_SECONDS: z.coerce.number().default(3600),

    ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"), 
    ADMIN_NAME: z.string().optional(),
    ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 chars"),

    BACKUP_FILES_DIR: z.string().min(1, "BACKUP_FILES_DIR is required"),

    LOG_LEVEL: z.string().default("info"),

    ENABLE_SWAGGER: z.coerce.boolean().default(false), 
    WEBHOOK_URL: z.string().optional(),

    DOCS_BASIC_USER: z.string().optional(),
    DOCS_BASIC_PASS: z.string().optional(),
})
    .superRefine((env, ctx) => {
        if (env.REDIS_ENABLE && !env.REDIS_URL) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["REDIS_URL"],
                message: "REDIS_URL is required when REDIS_ENABLE is true",
            });
        }
    });

export const env = EnvSchema.parse(process.env);

