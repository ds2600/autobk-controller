// ------------------------------------------------------------
// src/modules/devices/devices.service.ts
// ------------------------------------------------------------
import { prisma } from "../../db/prisma";
import { writeAuditLog } from "../../utils/audit";
import { getOrSetCache, invalidateCache } from "../../utils/redis";

async function computeDeviceSummaries(page = 1, pageSize = 25, search = '') {
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { sName: { contains: search } },
            { sIP:   { contains: search } },
          ],
        }
      : {};

    const [total, devices] = await Promise.all([
        prisma.device.count({ where }),
        prisma.device.findMany({
            where,
            orderBy: { kSelf: "asc" },
            skip,
            take: pageSize,
            include: {
                Backups: { orderBy: { tComplete: "desc" }, take: 1 },
                Schedules: {
                    where: { 
                        OR: [
                            { sState: "Auto" },
                            { sState: "Manual" }
                        ],
                    },
                    orderBy: { tTime: "asc" },
                    take: 1,
                },
            },
        }),
    ]);

    const data = devices.map((d) => ({
      kSelf: d.kSelf,
      sName: d.sName,
      sType: d.sType,
      sIP: d.sIP,
      iAutoDay: d.iAutoDay,
      iAutoHour: d.iAutoHour,
      iAutoWeeks: d.iAutoWeeks,
      latestBackup: d.Backups[0] || null,
      nextScheduled: d.Schedules[0] || null,
    }));

    return { data, meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) } };
}

export const devicesService = {
    async listDevices() {
        return prisma.device.findMany();
    },

    async listDeviceSummaries(page = 1, pageSize = 25, search='') {
        const key = `devices:summary:v1:${page}:${pageSize}:${search.toLowerCase()}`;
        return getOrSetCache(key, 30, () => computeDeviceSummaries(page, pageSize, search));
    },


  async getDevice(id: number) {
    const device = await prisma.device.findUnique({ where: { kSelf: id } });
    if (!device) throw { status: 404, code: "DEVICE_NOT_FOUND", message: "Device not found" };
    return device;
  },

    async createDevice(data: any, reqMeta: any) {
        const { device, logDevice } = await prisma.$transaction(async (tx) => {
            const device = await tx.device.create({ data });

            let logDevice = null;

            if (device.sType === 'OneNet') {
                logDevice = await tx.device.create({
                    data: {
                        sName: `${device.sName} - Logs`,
                        sType: 'OneNetLog',
                        sIP: device.sIP,
                        iAutoDay: device.iAutoDay,
                        iAutoHour: device.iAutoHour,
                        iAutoWeeks: 8,
                    },
                });
            }

            return { device, logDevice };
        });

        await writeAuditLog({
          actorUserId: reqMeta.actorUserId,
          action: "create",
          resourceType: "Device",
          resourceId: String(device.kSelf),
          after: device,
          ...reqMeta,
        });

        if (logDevice) {
            await writeAuditLog({
                actorUserId: reqMeta.actorUserId,
                action: "create",
                resourceType: "Device",
                resourceId: String(logDevice.kSelf),
                after: logDevice,
                ...reqMeta,
            });
        }

        await invalidateCache("devices:summary:v1:");

        return device;
    },

  async updateDevice(id: number, data: any, reqMeta: any) {
    const before = await prisma.device.findUnique({ where: { kSelf: id } });
    if (!before) throw { status: 404, code: "DEVICE_NOT_FOUND", message: "Device not found" };

    const device = await prisma.device.update({ where: { kSelf: id }, data });

    await writeAuditLog({
      actorUserId: reqMeta.actorUserId,
      action: "update",
      resourceType: "Device",
      resourceId: String(id),
      before,
      after: device,
      ...reqMeta,
    });

    await invalidateCache("devices:summary:v1:");

    return device;
  },


      async deleteDevice(id: number, reqMeta: any) {
        const { removed, logDevice } = await prisma.$transaction(async (tx) => {
          const dev = await tx.device.findUnique({ where: { kSelf: id } });
          if (!dev) {
            throw { status: 404, code: "DEVICE_NOT_FOUND", message: "Device not found" };
          }

          // Delete Backups + Schedules for the primary device
          await tx.backup.deleteMany({ where: { kDevice: dev.kSelf } });
          await tx.schedule.deleteMany({ where: { kDevice: dev.kSelf } });

          let logDevice = null;

          // If this is a OneNet, also delete the matching OneNetLog
          if (dev.sType === "OneNet") {
            logDevice = await tx.device.findFirst({
              where: {
                sType: "OneNetLog",
                sName: dev.sName + "-Log",
              },
            });

            if (logDevice) {
              await tx.backup.deleteMany({ where: { kDevice: logDevice.kSelf } });
              await tx.schedule.deleteMany({ where: { kDevice: logDevice.kSelf } });
              await tx.device.delete({ where: { kSelf: logDevice.kSelf } });
            }
          }

          const removed = await tx.device.delete({ where: { kSelf: dev.kSelf } });

          return { removed, logDevice };
        });

        // Audit log for the primary device
        await writeAuditLog({
          actorUserId: reqMeta.actorUserId,
          action: "delete",
          resourceType: "Device",
          resourceId: String(id),
          before: removed,
          ...reqMeta,
        });

        if (logDevice) {
          await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "delete",
            resourceType: "Device",
            resourceId: String(logDevice.kSelf),
            before: logDevice,
            ...reqMeta,
          });
        }

        await invalidateCache("devices:summary:v1:");

        return removed;
      },

};

