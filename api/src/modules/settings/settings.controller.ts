// ------------------------------------------------------------
// src/modules/settings/settings.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { settingsService } from "./settings.service";
import { buildSuccess } from "../../utils/envelope";

export const settingsController = {
    async list(req: Request, res: Response) {
        const settings = await settingsService.listSettings();
        res.json(buildSuccess(settings, (req as any).requestId));
    },

    async get(req: Request, res: Response) {
        const key = req.params.key;
        const setting = await settingsService.getSetting(key);
        res.json(buildSuccess(setting, (req as any).requestId));
    },

    async update(req: Request, res: Response) {
        const key = req.params.key;

        const reqMeta = {
            actorUserId: (req as any).user?.userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const setting = await settingsService.updateSetting(key, req.body.value, reqMeta);
        res.json(buildSuccess(setting, reqMeta.requestId));
    },
};
