// ------------------------------------------------------------
// src/modules/devices/devices.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { devicesController } from "./devices.controller";
import { createDeviceSchema, updateDeviceSchema } from "./devices.schemas";
import { validate } from "../../middleware/validate";
import { authRequired } from "../../middleware/auth";

const router = Router();
router.use(authRequired);

router.get("/", devicesController.list);
router.get("/types", devicesController.getTypes);
router.get("/summary", devicesController.getSummary);
router.get("/:id", devicesController.get);
router.post("/", validate(createDeviceSchema), devicesController.create);
router.patch("/:id", validate(updateDeviceSchema), devicesController.update);
router.delete("/:id", devicesController.delete);

export default router;
