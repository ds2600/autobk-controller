// ------------------------------
// src/modules/info/info.controller.ts
// ------------------------------

import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { getRedis } from "../../utils/redis";
import { env } from "../../config/env";
import { VERSION } from "../../config/constants";

export const healthController = {
    async get(req: Request, res: Response) {
        const start = Date.now();

        // Database
        let dbHealthy = false;
        let dbLatencyMs: number | null = null;

        try {
            const dbStart = Date.now();
            await prisma.$queryRaw`SELECT 1;`;
            dbLatencyMs = Date.now() - dbStart;
            dbHealthy = true;
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: "Database connection failed",
                timestamp: new Date().toISOString(),
                componnents: {
                    database: { healthy: false, checked: true },
                    cache: { enabled: env.REDIS_ENABLE, checked: false }
                }
            });
        }

        // Cache
        const redisEnabled = !!env.REDIS_ENABLE;
        let cacheHealthy: boolean | null = null;

        if (redisEnabled) {
            const redis = getRedis();
            if (!redis) {
                cacheHealthy = false;
            } else {
                try {
                    const pong = await redis.ping();
                    cacheHealthy = pong === "PONG";
                } catch {
                    cacheHealthy = false;
                }
            }
        } else {
            cacheHealthy = null;
        }

        const overallStatus = 
            dbHealthy && (cacheHealthy !== false) ? "ok" : "degraded";

        return res.status(200).json({
            status: overallStatus,
            uptime: process.uptime(),
            version: VERSION,
            timestamp: new Date().toISOString(),
            duration_ms: Date.now() - start,
            components: {
                database: {
                    healthy: dbHealthy,
                    latency_ms: dbLatencyMs,
                    checked: true
                }, 
                cache: {
                    enabled: redisEnabled,
                    healthy: cacheHealthy,
                    checked: redisEnabled
                }
            }
        });
    }
};

