// ------------------------------------------------------------
// src/jobs/pruneAudit.ts
// ------------------------------------------------------------
import { prisma } from "../db/prisma";


export async function pruneOldAuditLogs() {
    const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);


    await prisma.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
    });


    console.log("Pruned audit logs older than 365 days.");
}
