// ------------------------------------------------------------
// src/modules/devices/devices.schemas.ts
// ------------------------------------------------------------
import { z } from "zod";
import { DeviceType } from "@prisma/client";


export const createDeviceSchema = z.object({
sName: z.string().min(1),
sType: z.nativeEnum(DeviceType),
sIP: z.string().min(7),
iAutoDay: z.number().int().min(0).max(7),
iAutoHour: z.number().int().min(0).max(23),
iAutoWeeks: z.number().int().min(1),
});


export const updateDeviceSchema = z.object({
sName: z.string().optional(),
sType: z.nativeEnum(DeviceType).optional(),
sIP: z.string().optional(),
iAutoDay: z.number().int().min(0).max(7).optional(),
iAutoHour: z.number().int().min(0).max(23).optional(),
iAutoWeeks: z.number().int().min(1).optional(),
});
