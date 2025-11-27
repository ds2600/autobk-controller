// ------------------------------------------------------------
// src/modules/schedules/schedules.service.ts
// ------------------------------------------------------------
import { prisma } from "../../db/prisma";
import { writeAuditLog } from "../../utils/audit";
import { getOrSetCache, invalidateCache } from "../../utils/redis";


export const schedulesService = {
    async listSchedules(deviceId?: number) {
        return prisma.schedule.findMany({
            where: deviceId ? { kDevice: deviceId } : {},
            orderBy: { tTime: "desc" },
        });
    },


    async getSchedule(id: number) {
        const schedule = await prisma.schedule.findUnique({ where: { kSelf: id } });
        if (!schedule) throw { status: 404, code: "SCHEDULE_NOT_FOUND", message: "Schedule not found" };
        return schedule;
    },

    async createSchedule(data: any, reqMeta: any) {
        const schedule = await prisma.schedule.create({ data });

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "create",
            resourceType: "Schedule",
            resourceId: String(schedule.kSelf),
            after: schedule,
            ...reqMeta,
        });
        invalidateCache("schedules:");
        invalidateCache("devices:");
        return schedule;
    },

    async updateSchedule(id: number, data: any, reqMeta: any) {
        const before = await prisma.schedule.findUnique({ where: { kSelf: id } });
        if (!before) throw { status: 404, code: "SCHEDULE_NOT_FOUND", message: "Schedule not found" };

        const schedule = await prisma.schedule.update({ where: { kSelf: id }, data });

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "update",
            resourceType: "Schedule",
            resourceId: String(id),
            before,
            after: schedule,
            ...reqMeta,
        });

        return schedule;
    },


    async deleteSchedule(id: number, reqMeta: any) {
        const before = await prisma.schedule.findUnique({ where: { kSelf: id } });
        if (!before) throw { status: 404, code: "SCHEDULE_NOT_FOUND", message: "Schedule not found" };

        await prisma.schedule.delete({ where: { kSelf: id } });

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "delete",
            resourceType: "Schedule",
            resourceId: String(id),
            before,
            ...reqMeta,
        });

        return before;
    },
};
