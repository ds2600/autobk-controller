// -------------------------------
// src/utils/audit.ts
// -------------------------------
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface AuditOptions {
    actorUserId?: number;
    action: string;
    resourceType: string;
    resourceId: string;
    before?: any;
    after?: any;
    ip?: string;
    userAgent?: string;
    requestId?: string;
}

export async function writeAuditLog(opts: AuditOptions) {
    await prisma.auditLog.create({
        data: {
            actorUserId: opts.actorUserId || null,
            action: opts.action,
            resourceType: opts.resourceType,
            resourceId: opts.resourceId,
            before: opts.before || null,
            after: opts.after || null,
            ip: opts.ip || null,
            userAgent: opts.userAgent || null,
            requestId: opts.requestId || null,
        },
    });
}
