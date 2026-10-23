// ------------------------------------------------------------
// src/modules/agentUpdates/agentUpdates.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { agentUpdatesService } from "./agentUpdates.service";
import { buildSuccess, buildError } from "../../utils/envelope";

function reqMetaOf(req: Request) {
    return {
        actorUserId: (req as any).user?.userId,
        requestId: (req as any).requestId,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || undefined,
    };
}

export const agentUpdatesController = {
    async checkForUpdate(req: Request, res: Response) {
        const data = await agentUpdatesService.checkForUpdate();
        res.json(buildSuccess(data, (req as any).requestId));
    },

    startDownload(req: Request, res: Response) {
        const reqMeta = reqMetaOf(req);
        try {
            const job = agentUpdatesService.startDownload(req.body?.version, reqMeta);
            res.status(202).json(buildSuccess({ jobId: job.id, status: job.status }, reqMeta.requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "AGENT_UPDATE_DOWNLOAD_FAILED", error.message, null, reqMeta.requestId)
            );
        }
    },

    startApply(req: Request, res: Response) {
        const reqMeta = reqMetaOf(req);
        try {
            const job = agentUpdatesService.startApply(req.body?.stagingId, reqMeta);
            res.status(202).json(buildSuccess({ jobId: job.id, status: job.status }, reqMeta.requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "AGENT_UPDATE_APPLY_FAILED", error.message, null, reqMeta.requestId)
            );
        }
    },

    startRollback(req: Request, res: Response) {
        const reqMeta = reqMetaOf(req);
        try {
            const job = agentUpdatesService.startRollback(reqMeta);
            res.status(202).json(buildSuccess({ jobId: job.id, status: job.status }, reqMeta.requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "AGENT_UPDATE_ROLLBACK_FAILED", error.message, null, reqMeta.requestId)
            );
        }
    },

    getJobLog(req: Request, res: Response) {
        const requestId = (req as any).requestId;
        try {
            const offset = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10) || 0);
            const job = agentUpdatesService.getJob(req.params.jobId);
            res.json(buildSuccess({
                status: job.status,
                lines: job.lines.slice(offset),
                nextOffset: job.lines.length,
                result: job.result || null,
                error: job.error || null,
            }, requestId));
        } catch (error: any) {
            res.status(error.status || 500).json(
                buildError(error.code || "AGENT_UPDATE_JOB_NOT_FOUND", error.message, null, requestId)
            );
        }
    },
};
