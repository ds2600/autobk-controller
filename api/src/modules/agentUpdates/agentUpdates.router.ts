// ------------------------------------------------------------
// src/modules/agentUpdates/agentUpdates.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { agentUpdatesController } from "./agentUpdates.controller";
import { authRequired, adminOnly } from "../../middleware/auth";

const router = Router();
router.use(authRequired);

router.get("/check", agentUpdatesController.checkForUpdate);
router.post("/download", adminOnly, agentUpdatesController.startDownload);
router.post("/apply", adminOnly, agentUpdatesController.startApply);
router.post("/rollback", adminOnly, agentUpdatesController.startRollback);
router.get("/jobs/:jobId/log", adminOnly, agentUpdatesController.getJobLog);

export default router;
