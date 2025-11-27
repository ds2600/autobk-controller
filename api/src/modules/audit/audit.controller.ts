// ------------------------------------------------------------
// src/modules/audit/audit.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { buildSuccess } from "../../utils/envelope";


export const auditController = {
    async list(req: Request, res: Response) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const logs = await prisma.auditLog.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        res.json(buildSuccess(logs, (req as any).requestId));
    },
};
