// src/config/env.ts
import 'dotenv/config';
import { z } from "zod";

// ------------------------------------------------------------
// Environment Variable Schema
// ------------------------------------------------------------
// z.coerce.boolean() calls JS Boolean(value), so any non-empty string
// (including the literal "false") coerces to true. Env vars arrive as
// strings, so booleans need an explicit string comparison instead.
const zBoolEnv = (def: boolean) =>
    z
        .string()
        .optional()
        .transform((v) => (v ?? String(def)).toLowerCase() === "true");

const EnvSchema = z.object({

    APP_NAME: z.string().default("AutoBk Controller"),
    APP_URL: z.string().url("APP_URL must be a valid URL").default("http://localhost:3000"),

    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    API_INTERNAL_BASE: z.string().default("http://localhost:3000"),
    API_BROWSER_BASE: z.string().default("/api"),

    CORS_ORIGINS: z.string().optional(),

    REDIS_ENABLE: zBoolEnv(false),
    REDIS_URL: z.string().optional(),
    CACHE_TTL_DEVICES_SUMMARY: z.coerce.number().default(300),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
    JWT_TTL_SECONDS: z.coerce.number().default(3600),

    ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"), 
    ADMIN_NAME: z.string().optional(),
    ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 chars"),

    BACKUP_FILES_DIR: z.string().min(1, "BACKUP_FILES_DIR is required"),

    AGENT_PYTHON: z.string().default("/opt/autobk-agent/venv/bin/python3"),
    EAS_RUN_TIMEOUT_MS: z.coerce.number().default(600000),

    LOG_LEVEL: z.string().default("info"),

    ENABLE_SWAGGER: zBoolEnv(false),
    WEBHOOK_URL: z.string().optional(),

    // Optional: raises the GitHub API rate limit for the self-update check (60/hr -> 5000/hr)
    // and keeps the same code working unmodified if this repo is ever made private. Not
    // required -- the repo is public, so the check works with no token at all.
    GITHUB_TOKEN: z.string().optional(),
    CACHE_TTL_GITHUB_RELEASE: z.coerce.number().default(3600),

    // Release-directory + symlink layout for self-apply (api/src/modules/updates). Sibling
    // `shared/`, `current`, and `var/updates/staging/` dirs are derived from this one path --
    // see README.md's "Self-Update" section for the full directory structure this assumes.
    RELEASES_DIR: z.string().default("/opt/autobk-controller/releases"),
    // systemd service name for the PHP-FPM pool -- apply/rollback restart it after every
    // symlink swap, since PHP-FPM's opcache otherwise keeps serving whatever version was
    // live the last time it happened to restart, independent of `current`. "php-fpm" is
    // correct on RHEL/AlmaLinux; Debian/Ubuntu name it per-version (e.g. "php8.3-fpm").
    PHP_FPM_SERVICE: z.string().default("php-fpm"),

    DOCS_BASIC_USER: z.string().optional(),
    DOCS_BASIC_PASS: z.string().optional(),

    SMTP_ENABLE: zBoolEnv(false),
    MAIL_FROM: z.string().email("MAIL_FROM must be a valid email").optional(),
    MAIL_NAME: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_SECURE: zBoolEnv(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),

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

