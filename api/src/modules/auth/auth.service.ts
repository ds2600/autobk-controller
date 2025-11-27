// ------------------------------------------------------------
// src/modules/auth/auth.service.ts
// ------------------------------------------------------------
import { prisma } from "../../db/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { writeAuditLog } from "../../utils/audit";


export const authService = {
    async login(email: string, password: string, reqMeta: any) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            writeAuditLog({
                actorUserId: null,
                action: "failed_login",
                resourceType: "User",
                resourceId: user ? String(user.id) : "unknown",
                after: { 
                    emailAttempted: email,
                    reason: !user ? "user_not_found" : "user_inactive",
                },
                ...reqMeta,
            });

            return { status: 401, code: "INVALID_CREDENTIALS", message: "Invalid email or password" };
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            writeAuditLog({
                actorUserId: null,
                action: "failed_login",
                resourceType: "User",
                resourceId: String(user.id),
                after: { 
                    emailAttempted: email,
                    reason: "invalid_password",
                },
                ...reqMeta,
            });

            return { status: 401, code: "INVALID_CREDENTIALS", message: "Invalid email or password" };
        }
        
        const { passwordHash, ...userData } = user;

        const token = jwt.sign(
            { userId: userData.id, role: userData.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_TTL_SECONDS }
        );

        await writeAuditLog({
            actorUserId: userData.id,
            action: "login",
            resourceType: "User",
            resourceId: String(userData.id),
            after: { email: userData.email },
            ...reqMeta,
        });


        return { status: 200, token, userData };
    },

    async logout(userId: number | undefined, reqMeta: any) {
        await writeAuditLog({
            actorUserId: userId || null,
            action: "logout",
            resourceType: "Session",
            resourceId: userId ? String(userId) : "anonymous",
            ...reqMeta,
        });
    },
    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string,
        reqMeta: any 
      ) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
          return {
            status: 404,
            code: "USER_NOT_FOUND",
            message: "User not found",
          };
        }

        const ok = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!ok) {
          return {
            status: 400,
            code: "INVALID_CURRENT_PASSWORD",
            message: "Current password is incorrect",
          };
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        const updated = await prisma.user.update({
          where: { id: userId },
          data: {
            passwordHash: newHash,
            tokenVersion: { increment: 1 },
            passwordResetRequired: false,
          },
        });

        await writeAuditLog({
          actorUserId: userId,
          action: "change_password",
          resourceType: "User",
          resourceId: String(userId),
          before: null,
          after: {
            passwordResetRequired: false,
            tokenVersion: updated.tokenVersion,
          },
          ip: reqMeta.ip,
          userAgent: reqMeta.userAgent,
          requestId: reqMeta.requestId,
        });

        return {
          status: 200,
        };
      },
    async resetPasswordWithToken(
        token: string,
        newPassword: string,
        reqMeta: any,
    ) {
        const reset = await prisma.passwordReset.findFirst({
            where: {
                token,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            select: { id: true, userId: true },
        });

        if (!reset) {
            return { status: 400, code: "INVALID_OR_EXPIRED_TOKEN", message: "The password reset token is invalid or has expired" };
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { id: reset.userId },
            data: { 
                passwordHash,
                passwordResetRequired: false,
                tokenVersion: { increment: 1 },
            },
        });

        await prisma.passwordReset.update({
            where: { id: reset.id },
            data: { usedAt: new Date() },
        });

        await writeAuditLog({
            actorUserId: user.id,
            action: "reset_password",
            resourceType: "User",
            resourceId: String(user.id),
            after: { email: user.email, passwordResetRequired: false },
            ...reqMeta,
        });
        
        return { userId: user.id };
    },
};
