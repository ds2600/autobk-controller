// ------------------------------------------------------------
// src/modules/reports/reports.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { reportsController } from "./reports.controller";
import { authRequired } from "../../middleware/auth";
import { z } from "zod";
import { validateQuery } from "../../middleware/validate";


const router = Router();
router.use(authRequired);

const reportQuery = z.object({
    days: z.coerce.number().int().min(1).max(365).default(7),
});

router.get("/recent-backups", validateQuery(reportQuery), reportsController.recentBackups);
router.get("/recent-failures", validateQuery(reportQuery), reportsController.recentFailures);
router.post("/last24hours-webhook", reportsController.sendLast24HoursReportViaWebhook);

export default router;
