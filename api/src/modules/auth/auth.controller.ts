// ------------------------------------------------------------
// src/modules/auth/auth.controller.ts
// ------------------------------------------------------------
import { Request, Response, NextFunction } from "express";
import { buildError, buildSuccess } from "../../utils/envelope";
import { authService } from "./auth.service";


export const authController = {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const reqMeta = {
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
        };

        const result = await authService.login(email, password, reqMeta);
        if (result.status && result.status == 200) {
            res.json(buildSuccess(result, reqMeta.requestId));
        } else {
            const errorCode = result.code || "AUTH_ERROR";
            const resultMessage = result.message || "Authentication failed";
            res.json(buildError(errorCode, resultMessage, null, reqMeta.requestId));
        }
    },


    async logout(req: Request, res: Response) {
        const userId = (req as any).user?.userId;
        const reqMeta = {
            requestId: (req as any).requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
    };


        await authService.logout(userId, reqMeta);
        res.json(buildSuccess({ loggedOut: true }, reqMeta.requestId));
    },

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
          const userCtx = (req as any).user;
          const requestId = (req as any).requestId;

          if (!userCtx?.userId) {
            return res
              .status(401)
              .json(
                buildError(
                  "UNAUTHORIZED",
                  "User not authenticated",
                  null,
                  requestId
                )
              );
          }

          const { currentPassword, newPassword } = req.body;
          const userId = userCtx.userId;

          const reqMeta = {
            requestId,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || null,
          };

          const result = await authService.changePassword(
            userId,
            currentPassword,
            newPassword,
            reqMeta
          );

          if (result.status && result.status !== 200) {
            return res
              .status(result.status)
              .json(
                buildError(
                  result.code || "PASSWORD_CHANGE_FAILED",
                  result.message || "Failed to change password",
                  null,
                  requestId
                )
              );
          }

          return res.json(
            buildSuccess(
              { changed: true },
              requestId
            )
          );
        } catch (err) {
          next(err);
        }
      },
};
