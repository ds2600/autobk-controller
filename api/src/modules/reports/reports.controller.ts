// ------------------------------------------------------------
// src/modules/reports/reports.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { reportsService } from "./reports.service";
import { buildError, buildSuccess } from "../../utils/envelope";


export const reportsController = {
    async recentBackups(req: Request, res: Response) {
        const days = Number(req.query.days) || 7;
        const data = await reportsService.recentBackups(days);
        res.json(buildSuccess(data, (req as any).requestId));
    },
    async recentFailures(req: Request, res: Response) {
        const days = Number(req.query.days) || 7;
        const data = await reportsService.recentFailures(days);
        res.json(buildSuccess(data, (req as any).requestId));
    },

    async sendLast24HoursReportViaWebhook(req: Request, res: Response) {
        if (!process.env.WEBHOOK_URL) {
            return res.json(buildError("NO_WEBHOOK_URL", "Webhook URL is not configured.", null, (req as any).requestId));
        }
        const result = await reportsService.sendLast24HoursReportToWebhook();
        return res.json(buildSuccess(result, (req as any).requestId));
    }

};
