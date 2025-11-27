// --------------------------------
// src/modules/info/info.router.ts
// --------------------------------

import { Router } from "express";
import { infoController } from "./info.controller";

const router = Router();

router.get("/", infoController.getInfo);

export default router;
