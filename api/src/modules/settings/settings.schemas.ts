// ------------------------------------------------------------
// src/modules/settings/settings.schemas.ts
// ------------------------------------------------------------
import { z } from "zod";


export const updateSettingSchema = z.object({
value: z.string().nullable().optional(),
});
