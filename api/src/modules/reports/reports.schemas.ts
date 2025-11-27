// ------------------------------------------------------------
// src/modules/reports/reports.schemas.ts
// ------------------------------------------------------------
import { z } from "zod";


export const reportQuerySchema = z.object({
    days: z.number().int().min(1).max(90).default(7),
});
