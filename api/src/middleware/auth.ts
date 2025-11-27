// ------------------------------------------------------------
// src/middleware/auth.ts
// ------------------------------------------------------------
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { ROLES } from "../config/constants";
import * as cookie from "cookie";

type AuthedUser = JwtPayload & {
  sub?: string;
  email?: string;
  role?: string;
};

function extractToken(req: Request): string | undefined {
    // 1) Authorization: Bearer <token>
    const header = req.headers["authorization"];
    if (header) {
        const [scheme, token] = header.split(" ");
        if (scheme?.toLowerCase() === "bearer" && token) return token;
    }
    // 2) Cookie: autobk_jwt=<token>
    if (req.headers.cookie) {
        const jar = cookie.parse(req.headers.cookie);
        if (jar.autobk_jwt) return jar.autobk_jwt;
    }
    return undefined;
}

export function authRequired(req: Request, _res: Response, next: NextFunction) {
    const token = extractToken(req);
    if (!token) return next({ status: 401, code: "AUTH_REQUIRED", message: "Missing token" });

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as AuthedUser;
        (req as any).user = decoded;
        return next();
    } catch {
        return next({ status: 401, code: "INVALID_TOKEN", message: "Invalid or expired token" });
    }
}

export function adminOnly(req: Request, _res: Response, next: NextFunction) {
    const role = (req as any).user?.role;
    if (role !== ROLES.ADMIN) {
        return next({ status: 403, code: "FORBIDDEN", message: "Admin only" });
    }
    return next();
}

