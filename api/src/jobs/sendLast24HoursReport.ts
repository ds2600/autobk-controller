// -------------------------------
// src/jobs/sendLast24HoursReport.ts
// -------------------------------

import { reportsService } from "../modules/reports/reports.service";

(async () => {
    try {
        const result = await reportsService.sendLast24HoursReportToWebhook();
        console.log("Report sent:", result);
        process.exit(0);
    } catch (error) {
        console.error("Error sending report:", error);
        process.exit(1);
    }
})();
