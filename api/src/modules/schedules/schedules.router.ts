// ------------------------------------------------------------
// src/modules/schedules/schedules.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { schedulesController } from "./schedules.controller";
import { createScheduleSchema, updateScheduleSchema } from "./schedules.schemas";
import { validate } from "../../middleware/validate";
import { authRequired } from "../../middleware/auth";


const router = Router();
router.use(authRequired);


router.get("/", schedulesController.list);
router.get("/:id", schedulesController.get);
router.post("/", validate(createScheduleSchema), schedulesController.create);
router.patch("/:id", validate(updateScheduleSchema), schedulesController.update);
router.delete("/:id", schedulesController.delete);


export default router;
