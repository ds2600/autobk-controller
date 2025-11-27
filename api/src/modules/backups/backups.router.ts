// ------------------------------------------------------------
// src/modules/backups/backups.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { backupsController } from "./backups.controller";
import { createBackupSchema, updateBackupSchema } from "./backups.schemas";
import { validate } from "../../middleware/validate";
import { authRequired } from "../../middleware/auth";


const router = Router();
router.use(authRequired);


router.get("/", backupsController.list);
router.get("/:id", backupsController.get);
router.get("/:id/download", backupsController.download);
router.post("/", validate(createBackupSchema), backupsController.create);
router.patch("/:id", validate(updateBackupSchema), backupsController.update);
router.delete("/:id", backupsController.delete);


export default router;
