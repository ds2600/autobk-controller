// ------------------------------------------------------------
// src/modules/backups/backups.service.ts
// ------------------------------------------------------------
import { prisma } from "../../db/prisma";
import { writeAuditLog } from "../../utils/audit";
import { resolveBackupFile } from "../../utils/filePath";


export const backupsService = {
    async listBackups(deviceId?: number) {
        return prisma.backup.findMany({
            where: deviceId ? { kDevice: deviceId } : {},
            orderBy: { tComplete: "desc" },
        });
    },

    async getBackup(id: number) {
        const backup = await prisma.backup.findUnique({ where: { kSelf: id } });
        if (!backup) throw { status: 404, code: "BACKUP_NOT_FOUND", message: "Backup not found" };
        return backup;
    },

    async createBackup(data: any, reqMeta: any) {
        const backup = await prisma.backup.create({ data });
        await writeAuditLog({
        actorUserId: reqMeta.actorUserId,
        action: "create",
        resourceType: "Backup",
        resourceId: String(backup.kSelf),
        after: backup,
        ...reqMeta,
        });
        return backup;
    },

    async updateBackup(id: number, data: any, reqMeta: any) {
        const before = await prisma.backup.findUnique({ where: { kSelf: id } });
        if (!before) throw { status: 404, code: "BACKUP_NOT_FOUND", message: "Backup not found" };

        const backup = await prisma.backup.update({ where: { kSelf: id }, data });

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "update",
            resourceType: "Backup",
            resourceId: String(id),
            before,
            after: backup,
            ...reqMeta,
        });
        return backup;
    },

    async deleteBackup(id: number, reqMeta: any) {
        const before = await prisma.backup.findUnique({ where: { kSelf: id } });
        if (!before) throw { status: 404, code: "BACKUP_NOT_FOUND", message: "Backup not found" };

        await prisma.backup.delete({ where: { kSelf: id } });

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "delete",
            resourceType: "Backup",
            resourceId: String(id),
            before,
            ...reqMeta,
        });

        return before;
    },

    async getBackupFilePath(id: number) {
        const backup = await prisma.backup.findUnique({ where: { kSelf: id } });
        if (!backup) throw { status: 404, code: "BACKUP_NOT_FOUND", message: "Backup not found" };
        return resolveBackupFile(backup.kDevice, backup.sFile);
    },
};
