// ------------------------------------------------------------
// src/modules/auth/auth.router.ts
// ------------------------------------------------------------
import { Router } from "express";
import { authController } from "./auth.controller";
import { loginSchema } from "./auth.schemas";
import { validate } from "../../middleware/validate";
import { authRequired } from "../../middleware/auth";
import { changePasswordSchema } from "./auth.schemas";


const router = Router();


router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/change-password", authRequired, validate(changePasswordSchema), authController.changePassword);

router.get('/me', authRequired, (req, res) => {
    const u = (req as any).user || {};
    res.json({ success: true, data: { email: u.email, role: u.role }, error: null, meta: {} });
});


export default router;
