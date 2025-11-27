// ------------------------------------------------------------
// src/modules/backups/backups.schemas.ts
// ------------------------------------------------------------
import { z } from "zod";


export const createBackupSchema = z.object({
    kDevice: z.number().int().min(1),
    tComplete: z.string().datetime(),
    tExpires: z.string().datetime().nullable().optional(),
    sFile: z.string().min(1),
    sComment: z.string().optional(),
});


export const updateBackupSchema = z.object({
    tExpires: z.string().datetime().nullable().optional(),
    sComment: z.string().optional(),
});
