// ------------------------------
// src/modules/info/info.controller.ts
// ------------------------------

import { Request, Response } from "express";
import os from "os";
import path from "path";
import disk from "diskusage";
import { VERSION, API_VERSION } from "../../config/constants";
import { buildSuccess } from "../../utils/envelope";
import { prisma } from "../../db/prisma";

async function getMySqlVersion() {
    const result = await prisma.$queryRaw<{ version: string }[]>`
        SELECT VERSION() as version;`;
    return result[0]?.version || "Unknown";
}

export const infoController = {
    async getInfo(req: Request, res: Response) {
        const rootPath = os.platform() === "win32" ? path.parse(process.cwd()).root : "/"
        const dbVersion = await getMySqlVersion();

        let storageInfo = { total: 0, free: 0 };
        try {
            const { total, free } = await disk.check(rootPath);
            storageInfo = { total, free };
        } catch (error) {
            console.error("Error fetching disk usage:", error);
        }

        const info = {
            appVersion: VERSION,
            apiVersion: API_VERSION,
            nodeVersion: process.version,
            dbVersion: dbVersion,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            platform: os.platform(),
            arch: os.arch(),
            cpuCount: os.cpus().length,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            totalStorage: storageInfo.total,
            freeStorage: storageInfo.free,
            hostname: os.hostname(),
            environment: process.env.NODE_ENV || "development",
            timestamp: new Date().toISOString(),
        };
        res.json(buildSuccess(info, (req as any).requestId));
    },

    
};
