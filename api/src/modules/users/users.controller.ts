// ------------------------------------------------------------
// src/modules/users/users.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { usersService } from "./users.service";
import { buildSuccess } from "../../utils/envelope";


export const usersController = {
    async me(req: Request, res: Response) {
        const userId = (req as any).user?.userId;
        const user = await usersService.getUser(userId);

        const safe = { 
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            isDailyReportEnabled: user.isDailyReportEnabled,
        };

        res.json(buildSuccess(safe, (req as any).requestId));
    },

    async updateMe(req: Request, res: Response) {
        const userId = (req as any).user?.userId;

        const reqMeta = {
            actorUserId: userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const data: any = { email: req.body.email };
        if (typeof req.body.isDailyRerpotEnabeld === "boolean") {
            data.isDailyReportEnabled = req.body.isDailyRerpotEnabeld;
        }

        const user = await usersService.updateUser(userId, data, reqMeta);

          res.json(
            buildSuccess(
              {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                isDailyReportEnabled: user.isDailyReportEnabled,
              },
              reqMeta.requestId
            )
          );
    },
    
    async list(req: Request, res: Response) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 25;


        const users = await usersService.listUsers(page, limit);
        res.json(buildSuccess(users, (req as any).requestId));
    },

    async get(req: Request, res: Response) {
        const id = Number(req.params.id);
        const user = await usersService.getUser(id);
        res.json(buildSuccess(user, (req as any).requestId));
    },

    async create(req: Request, res: Response) {
        const reqMeta = {
            actorUserId: (req as any).user?.userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const user = await usersService.createUser(req.body, reqMeta);
        res.json(buildSuccess(user, reqMeta.requestId));
    },

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);

        const reqMeta = {
            actorUserId: (req as any).user?.userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const user = await usersService.updateUser(id, req.body, reqMeta);
        res.json(buildSuccess(user, reqMeta.requestId));
    },

    async forcePasswordReset(req: Request, res: Response) {
        const id = Number(req.params.id);
        const required: boolean = req.body.required;

        const reqMeta = {
            actorUserId: (req as any).user?.userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const user = await usersService.forcePasswordReset(id, required, reqMeta);
        res.json(buildSuccess(user, reqMeta.requestId));
    },

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);

        const reqMeta = {
            actorUserId: (req as any).user?.userId,
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const result = await usersService.deleteUser(id, reqMeta);
        res.json(buildSuccess(result, reqMeta.requestId));
    },
};
