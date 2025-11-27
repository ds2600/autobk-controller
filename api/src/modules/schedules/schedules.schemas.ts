// ------------------------------------------------------------
// src/modules/schedules/schedules.schemas.ts
// ------------------------------------------------------------
import { z } from "zod";
import { ScheduleState } from "@prisma/client";


export const createScheduleSchema = z.object({
kDevice: z.number().int().min(1),
sState: z.nativeEnum(ScheduleState).default("Manual"),
tTime: z.string().datetime(),
iAttempt: z.number().int().optional(),
sComment: z.string().optional(),
});


export const updateScheduleSchema = z.object({
sState: z.nativeEnum(ScheduleState).optional(),
tTime: z.string().datetime().optional(),
iAttempt: z.number().int().optional(),
sComment: z.string().optional(),
});
