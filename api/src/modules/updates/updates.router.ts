// ------------------------------------------------------------
// src/modules/updates/updates.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import os from "os";
import multer from "multer";
import { updatesController } from "./updates.controller";
import { authRequired, adminOnly } from "../../middleware/auth";

// Uploaded bundles land in the OS tmp dir first; updatesService.uploadBundle() moves/extracts
// the validated file into the real staging dir and deletes the tmp copy either way.
const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 200 * 1024 * 1024 },
});

const router = Router();
router.use(authRequired);

router.get("/check", updatesController.checkForUpdate);
router.post("/upload", adminOnly, upload.single("bundle"), updatesController.uploadBundle);
router.post("/apply", adminOnly, updatesController.startApply);
router.post("/rollback", adminOnly, updatesController.startRollback);
router.get("/jobs/:jobId/log", adminOnly, updatesController.getJobLog);

export default router;
