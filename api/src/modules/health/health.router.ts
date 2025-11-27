// ------------------------------------------------------------
// src/modules/health/health.routes.ts
// ------------------------------------------------------------
import { Router } from "express";
import { healthController } from "./health.controller";

const router = Router();

router.get("/", healthController.get);

export default router;
