// ------------------------------------------------------------
// src/modules/users/users.service.ts
// ------------------------------------------------------------
import { prisma } from "../../db/prisma";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "../../utils/audit";


export const usersService = {
    async listUsers(page: number, limit: number) {
        return prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
        });
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
        const passwordHash = await bcrypt.hash(data.password, 10);

        const { password, ...userData } = data;

        const user = await prisma.user.create({
            data: { ...userData, passwordHash },
        });

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
        actorUserId: number | null,
        reqMeta: any
    ) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { passwordResetRequired: require },
            select: { id: true, email: true, passwordResetRequired: true },
        });

        await writeAuditLog({
            actorUserId,
            action: "force_password_reset",
            resourceType: "User",
            resourceId: String(userId),
            after:  { passwordResetRequired: require },
            ...reqMeta,
        });

        return user;

    }
};
