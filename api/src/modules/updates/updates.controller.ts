// ------------------------------------------------------------
// src/modules/updates/updates.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { updatesService } from "./updates.service";
import { buildSuccess, buildError } from "../../utils/envelope";

function reqMetaOf(req: Request) {
    return {
        actorUserId: (req as any).user?.userId,
        requestId: (req as any).requestId,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || undefined,
    };
}

export const updatesController = {
    async checkForUpdate(req: Request, res: Response) {
        const data = await updatesService.checkForUpdate();
        res.json(buildSuccess(data, (req as any).requestId));
    },

    async uploadBundle(req: Request, res: Response) {
        const reqMeta = reqMetaOf(req);
        const file = (req as any).file;
        if (!file) {
            res.status(400).json(buildError("UPDATES_NO_FILE", "No bundle file was uploaded", null, reqMeta.requestId));
            return;
        }
        try {
            const data = await updatesService.uploadBundle(file.path, file.originalname, reqMeta);
            res.json(buildSuccess(data, reqMeta.requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "UPDATES_UPLOAD_FAILED", error.message, null, reqMeta.requestId)
            );
        }
    },

    startApply(req: Request, res: Response) {
        const reqMeta = reqMetaOf(req);
        try {
            const job = updatesService.startApply(req.body?.stagingId, reqMeta);
            res.status(202).json(buildSuccess({ jobId: job.id, status: job.status }, reqMeta.requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "UPDATES_APPLY_FAILED", error.message, null, reqMeta.requestId)
            );
        }
    },

    async startRollback(req: Request, res: Response) {
        const reqMeta = reqMetaOf(req);
        try {
            const job = await updatesService.startRollback(reqMeta);
            res.status(202).json(buildSuccess({ jobId: job.id, status: job.status }, reqMeta.requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "UPDATES_ROLLBACK_FAILED", error.message, null, reqMeta.requestId)
            );
        }
    },

    getJobLog(req: Request, res: Response) {
        const requestId = (req as any).requestId;
        try {
            const offset = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10) || 0);
            const job = updatesService.getJob(req.params.jobId);
            res.json(buildSuccess({
                status: job.status,
                lines: job.lines.slice(offset),
                nextOffset: job.lines.length,
                result: job.result || null,
                error: job.error || null,
            }, requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "UPDATES_JOB_NOT_FOUND", error.message, null, requestId)
            );
        }
    },
};
