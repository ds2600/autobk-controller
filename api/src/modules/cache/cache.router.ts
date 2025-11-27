// ------------------------------------------------------------
// src/modules/cache/cache.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { cacheController } from "./cache.controller";
import { authRequired } from "../../middleware/auth";


const cacheRouter = Router();
cacheRouter.use(authRequired);

cacheRouter.get("/flush", cacheController.flush);
export default cacheRouter;
