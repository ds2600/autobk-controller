// ------------------------------------------------------------
// src/modules/reports/reports.service.ts
// ------------------------------------------------------------
import { prisma } from "../../db/prisma";
import { logoUri } from "../../config/logo";

type Last24HoursReport = {
    since: Date;
    now: Date;
    backups: Array<{
        kDevice: number;
        tComplete: Date;
        tExpires: Date | null;
        sFile: string | null;
        sComment: string | null;
        Device?: { sName: string };
    }>;
    failures: Array<{
        kDevice: number;
        sState: string;
        tTime: Date;
        sComment: string | null;
        Device?: { sName: string };
    }>;
};

export const reportsService = {
    async recentBackups(days: number) {
        const now = new Date();
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return prisma.backup.findMany({
            where: { 
                tComplete: { 
                    gte: cutoff, 
                    lte: now 
                } 
            },
            orderBy: { tComplete: "asc" },
            include: {
                Device: {
                    select: { sName: true},
                },
            },
        });
    },

    async recentFailures(days: number) {
        const now = new Date();
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return prisma.schedule.findMany({
            where: {
                sState: "Fail",
                tTime: { 
                    gte: cutoff, 
                    lte: now 
                },
            },
            orderBy: { tTime: "asc" },
            include: {
                Device: {
                    select: { sName: true},
                },
            },
        });
    },

    async last24HoursReport(): Promise<Last24HoursReport> {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const now = new Date();
        const backups = await this.recentBackups(1);
        const failures = await this.recentFailures(1);
        
        return {
            since,
            now,
            backups,
            failures,
        };
    },

    async sendLast24HoursReportToWebhook() {
        if (!process.env.WEBHOOK_URL) {
            console.log("WEBHOOK_URL not set, skipping report.");
            return;
        }

        const report = await this.last24HoursReport();
        const payload = this.buildChatCardReport(report);
        const response = await fetch(process.env.WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(`Failed to send report: ${response.status} ${response.statusText} - ${text}`);
        }

        return { ok: true, sent: true };
    },

    buildChatCardReport(report: Last24HoursReport) {
    const dateLabel = report.now.toISOString().slice(0, 10);

    return {
        cardsV2: [
            {
                cardId: "autobk-report",
                card: {
                    header: {
                        title: `AutoBk Daily Report`,
                        subtitle: `Last 24 hours • ${dateLabel}`,
                        imageUrl: logoUri,
                    },
                    sections: [
                        // Summary widgets
                        {
                            widgets: [
                                {
                                    columns: {
                                        columnItems: [
                                            {
                                                horizontalAlignment: "CENTER",
                                                widgets: [{
                                                    textParagraph: {
                                                        text: `<font color="#34A853"><b>${report.backups.length}</b></font>`
                                                    }
                                                }, {
                                                    textParagraph: { text: "Successful" }
                                                }]
                                            },
                                            {
                                                horizontalAlignment: "CENTER",
                                                widgets: [{
                                                    textParagraph: {
                                                        text: report.failures.length > 0
                                                            ? `<font color="#EA4335"><b>${report.failures.length}</b></font>`
                                                            : `<font color="#34A853"><b>0</b></font>`
                                                    }
                                                }, {
                                                    textParagraph: { text: "Failed" }
                                                }]
                                            }
                                        ]
                                    }
                                },
                                { divider: {} }
                            ]
                        },

                        // Successful Backups Section
                        {
                            header: `Successful Backups (${report.backups.length})`,
                            collapsible: true,
                            uncollapsibleWidgetsCount: Math.min(2, report.backups.length),
                            widgets: report.backups.length === 0
                                ? [{ textParagraph: { text: "<i>No backups completed in the last 24 hours.</i>" } }]
                                : report.backups.map(b => ({
                                  textParagraph: {
                                    text: `✅ <b>${b.Device?.sName ?? `Device #${b.kDevice}`}</b><br>` +
                                          `<font color="#34A853">${formatDate(b.tComplete)} UTC</font><br>` +
                                          `${b.sComment ? `${b.sComment}<br>` : ""}` 
                                  }
                            }))
                        },

                        // Failed Backups Section
                        {
                            header: `Failed Backups (${report.failures.length})`,
                            collapsible: true,
                            uncollapsibleWidgetsCount: Math.min(2, report.failures.length),
                            widgets: report.failures.length === 0
                                ? [{ textParagraph: { text: "<i>No failures recorded — great job!</i>" } }]
                                : report.failures.map(f => ({
                                    textParagraph: {
                                        text:
                                            `❌ <b>${f.Device?.sName ?? `Device #${f.kDevice}`}</b><br>` +
                                            `<font color="#EA4335">${formatDate(f.tTime)} UTC</font><br>` +
                                            `<b>${f.sState}</b>${f.sComment ? ` – ${f.sComment}` : ""}`
                                    },
                                }))
                        },

                        // Footer 
                        {
                            widgets: [
                                { divider: {} },
                                { textParagraph: 
                                    {
                                        text: `<font color="#666666"><i>Report generated at ${report.now.toISOString().slice(11, 19)} UTC</i></font>`
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
}};
function formatDate(date: Date): string {
    return date.toISOString().replace("T", " ").slice(0, 19);
}

