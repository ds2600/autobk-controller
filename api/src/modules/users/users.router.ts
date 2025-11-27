// ------------------------------------------------------------
// src/modules/users/users.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { usersController } from "./users.controller";
import { createUserSchema, updateUserSchema } from "./users.schemas";
import { validate } from "../../middleware/validate";
import { authRequired, adminOnly } from "../../middleware/auth";
import { z } from "zod";
import { validateQuery } from "../../middleware/validate";

const router = Router();


router.use(authRequired);

const paginationQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
});

router.get("/me", usersController.me);
router.patch("/me", validate(updateUserSchema), usersController.updateMe);
router.use(adminOnly);
router.get("/", validateQuery(paginationQuery), usersController.list);
router.post("/", validate(createUserSchema), usersController.create);
router.get("/:id", usersController.get);
router.patch("/:id", validate(updateUserSchema), usersController.update);
router.delete("/:id", usersController.delete);


export default router;
