// ------------------------------------------------------------
// src/modules/cache/cache.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { buildSuccess, buildError } from "../../utils/envelope";
import { writeAuditLog } from "../../utils/audit";
import { flushCache } from "../../utils/redis";


export const cacheController = {
    async flush(req: Request, res: Response) {
        const reqMeta: any = {
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        try {
            await flushCache();
                await writeAuditLog({
                  actorUserId: (req as any).user?.userId,
                  action: "flush_success",
                  resourceType: "cache",
                  resourceId: "all",
                  ...reqMeta,
                });

            res.json(buildSuccess("Cache flushed successfully", reqMeta.requestId));
        } catch (err) {
            const code = "CACHE_FLUSH_FAILED"; 
            const message = err instanceof Error ? err.message : "Cache flush failed unexpectedly";
            const details = err;

            await writeAuditLog({
                actorUserId: (req as any).user?.userId,
                action: "cache_flush",
                resourceType: "cache",
                resourceId: "all",
                before: null,
                after: {
                    status: "error",
                    code,
                    message,
                },
                ip: req.ip,
                userAgent: req.headers["user-agent"] || null,
                requestId: reqMeta.requestId,
                ...reqMeta,
            });

            res.status(500).json(buildError(code, message, details, reqMeta.requestId));      
        }
    }
};
