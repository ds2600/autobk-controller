// ------------------------------------------------------------
// src/modules/audit/audit.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { auditController } from "./audit.controller";
import { authRequired, adminOnly } from "../../middleware/auth";


const auditRouter = Router();
auditRouter.use(authRequired);
auditRouter.use(adminOnly);


auditRouter.get("/", auditController.list);
export default auditRouter;
