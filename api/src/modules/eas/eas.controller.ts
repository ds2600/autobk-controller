// ------------------------------------------------------------
// src/modules/eas/eas.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import fs from "fs";
import { easService } from "./eas.service";
import { buildSuccess, buildError } from "../../utils/envelope";
import { writeAuditLog } from "../../utils/audit";

export const easController = {
    async startOneNetVersionScrape(req: Request, res: Response) {
        const reqMeta = {
            actorUserId: (req as any).user?.userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || undefined,
        };

        try {
            const job = easService.startOneNetVersionScrape(reqMeta);
            await writeAuditLog({
                action: "run_start",
                resourceType: "EasOneNetVersionScrape",
                resourceId: job.id,
                ...reqMeta,
            });
            res.status(202).json(buildSuccess({ jobId: job.id, status: job.status }, reqMeta.requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "ONENET_SCRAPE_FAILED", error.message, null, reqMeta.requestId)
            );
        }
    },

    async getOneNetJobLog(req: Request, res: Response) {
        const requestId = (req as any).requestId;
        try {
            const offset = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10) || 0);
            const job = easService.getJob(req.params.jobId);
            res.json(buildSuccess({
                status: job.status,
                lines: job.lines.slice(offset),
                nextOffset: job.lines.length,
                result: job.result ? { name: job.result.name, generatedAt: job.result.generatedAt } : null,
                error: job.error || null,
            }, requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "EAS_JOB_NOT_FOUND", error.message, null, requestId)
            );
        }
    },

    async latestOneNetReport(req: Request, res: Response) {
        try {
            const report = await easService.getLatestOneNetReport();
            res.json(buildSuccess({ name: report.name, generatedAt: report.generatedAt }, (req as any).requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "ONENET_REPORT_MISSING", error.message, null, (req as any).requestId)
            );
        }
    },

    async downloadLatestOneNetReport(req: Request, res: Response) {
        try {
            const report = await easService.getLatestOneNetReport();
            res.setHeader("Content-Disposition", `attachment; filename="${report.name}"`);
            res.setHeader("Content-Type", "text/csv");
            fs.createReadStream(report.fullPath).pipe(res);
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "ONENET_REPORT_MISSING", error.message, null, (req as any).requestId)
            );
        }
    },
};
