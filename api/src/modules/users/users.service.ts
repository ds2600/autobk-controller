// ------------------------------------------------------------
// src/modules/users/users.service.ts
// ------------------------------------------------------------
import crypto from "crypto";
import { prisma } from "../../db/prisma";
import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "../../utils/audit";
import { sendMail } from "../../email/mailer";
import { buildNewUserInviteEmail } from "../../email/templates/newUserInvite";
import { env } from "../../config/env";

function generatePassword(length = 12): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}

type UserWithLastLogin = User & { lastLoginAt: Date | null };

export const usersService = {
    async listUsers(page: number, limit: number): Promise<UserWithLastLogin[]> {
        const users: User[] = await prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { id: "asc" },
        });

        const userIds = users.map(u => u.id);
        if (userIds.length === 0) {
            return users.map((u): UserWithLastLogin => ({
                ...u,
                lastLoginAt: null,
            }));
        }

        const loginLogs = await prisma.auditLog.findMany({
            where: {
                action: "login",
                resourceType: "User",
                resourceId: { in: userIds.map(id => String(id)) },
            },
            orderBy: { createdAt: "desc" },
        });

        const lastLoginByUser = new Map<number, Date>();
        for (const log of loginLogs) {
            const uid = Number(log.resourceId);
            if (!lastLoginByUser.has(uid)) {
                lastLoginByUser.set(uid, log.createdAt);
            }
        }

        return users.map(u => ({
            ...u,
            lastLoginAt: lastLoginByUser.get(u.id) ?? null,
        }));
    },

    async getUser(id: number) {
        if (!Number.isFinite(id)) {
            throw { status: 400, code: "INVALID_USER_ID", message: "Invalid user ID" };
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw { status: 404, code: "USER_NOT_FOUND", message: "User not found" };
        return user;
    },

    async createUser(data: any, reqMeta: any) {
        const generateTemp = !!data.generateTempPassword;
        const sendInvite = !!data.sendInviteEmail;

        if (!generateTemp && !data.password) {
            throw new Error("Set a password or enable generate temporary password");
        }

        let plainTempPassword: string | null = null;
        let passwordToUse: string;

        if (generateTemp) {
            plainTempPassword = generatePassword();
            passwordToUse = plainTempPassword!;
        } else {
            passwordToUse = data.password;
        }

        const passwordHash = await bcrypt.hash(passwordToUse, 10);

        const { password, generateTempPassword, sendInviteEmail: _s, ...userData } = data;


        const user = await prisma.user.create({
            data: { 
                ...userData, 
                passwordHash, 
                ...(generateTemp ? { passwordResetRequired: true } : {}),
            },
        });

        if (sendInvite && passwordToUse) {
            const email = buildNewUserInviteEmail({
                appName: env.APP_NAME,
                loginUrl: env.APP_URL + "/login.php",
                email: user.email,
                name: user.displayName || user.email,
                tempPassword: passwordToUse,
            });

            sendMail({
                to: `${user.displayName || user.email} <${user.email}>`,
                subject: email.subject,
                text: email.text,
                html: email.html,
            }).catch((err: any) => {
                console.error("Error sending new user invite email:", err);
            });
        }

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "create",
            resourceType: "User",
            resourceId: String(user.id),
            after: user,
            ...reqMeta,
        });

        return user;
    },

    async updateUser(id: number, data: any, reqMeta: any) {
        if (!Number.isFinite(id)) {
            throw { status: 400, code: "INVALID_USER_ID", message: "Invalid user ID" };
        }
        const before = await prisma.user.findUnique({ where: { id } });
        if (!before) throw { status: 404, code: "USER_NOT_FOUND", message: "User not found" };

        const user = await prisma.user.update({ where: { id }, data });

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "update",
            resourceType: "User",
            resourceId: String(id),
            before,
            after: user,
            ...reqMeta,
        });

        return user;
    },

    async deleteUser(id: number, reqMeta: any) {
        const user = await prisma.user.delete({ where: { id } });

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "delete",
            resourceType: "User",
            resourceId: String(id),
            before: user,
            ...reqMeta,
        });

        return user;
    },

    async forcePasswordReset(
        userId: number,
        require: boolean,
        reqMeta: any
    ) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { passwordResetRequired: require },
            select: { id: true, email: true, passwordResetRequired: true },
        });

        await writeAuditLog({
            actorUserId: reqMeta.actorUserId,
            action: "force_password_reset",
            resourceType: "User",
            resourceId: String(userId),
            after:  { passwordResetRequired: require },
            ...reqMeta,
        });

        return user;

    }
};
