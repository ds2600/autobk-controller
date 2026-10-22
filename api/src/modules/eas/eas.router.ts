// ------------------------------------------------------------
// src/modules/eas/eas.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { easController } from "./eas.controller";
import { authRequired, adminOnly } from "../../middleware/auth";

const router = Router();
router.use(authRequired);

router.get("/onenet-version/latest", easController.latestOneNetReport);
router.get("/onenet-version/download", easController.downloadLatestOneNetReport);
router.post("/onenet-version/run", adminOnly, easController.startOneNetVersionScrape);
router.get("/onenet-version/jobs/:jobId/log", easController.getOneNetJobLog);

export default router;
