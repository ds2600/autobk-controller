// ------------------------------------------------------------
// src/modules/backups/backups.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { backupsService } from "./backups.service";
import { buildSuccess, buildError } from "../../utils/envelope";
import fs from "fs";


export const backupsController = {
    async list(req: Request, res: Response) {
        const deviceId = req.query.deviceId ? Number(req.query.deviceId) : undefined;
        const backups = await backupsService.listBackups(deviceId);
        res.json(buildSuccess(backups, (req as any).requestId));
    },

    async get(req: Request, res: Response) {
        const id = Number(req.params.id);
        let result;
        try {
            const backup = await backupsService.getBackup(id);
            const filepath = await backupsService.getBackupFilePath(id);
            result = { ...backup, filepath };
        } catch (error: any) {
            return res.status(error.status || 500).json(buildError(error.code, error.message, null, (req as any).requestId));
        }
        res.json(buildSuccess(result, (req as any).requestId));
    },


    async create(req: Request, res: Response) {
        const reqMeta = {
            actorUserId: (req as any).user?.userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const backup = await backupsService.createBackup(req.body, reqMeta);
            res.json(buildSuccess(backup, reqMeta.requestId));
    },

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
            const reqMeta = {
                actorUserId: (req as any).user?.userId,
                requestId: (req as any).requestId,
                ip: req.ip,
                userAgent: req.headers["user-agent"] || null,
            };

        const backup = await backupsService.updateBackup(id, req.body, reqMeta);
        res.json(buildSuccess(backup, reqMeta.requestId));
    },

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);
        const reqMeta = {
            actorUserId: (req as any).user?.userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const result = await backupsService.deleteBackup(id, reqMeta);
        res.json(buildSuccess(result, reqMeta.requestId));
    },

    async download(req: Request, res: Response) {
        const id = Number(req.params.id);
        const filepath = await backupsService.getBackupFilePath(id);


        res.setHeader("Content-Disposition", `attachment; filename="${filepath.split("/").pop()}"`);
        fs.createReadStream(filepath).pipe(res);
    },
};
