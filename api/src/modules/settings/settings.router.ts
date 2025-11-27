// ------------------------------------------------------------
// src/modules/settings/settings.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { settingsController } from "./settings.controller";
import { updateSettingSchema } from "./settings.schemas";
import { validate } from "../../middleware/validate";
import { authRequired, adminOnly } from "../../middleware/auth";


const router = Router();
router.use(authRequired);
router.use(adminOnly);


router.get("/", settingsController.list);
router.get("/:key", settingsController.get);
router.patch("/:key", validate(updateSettingSchema), settingsController.update);


export default router;
