// -------------------------------
// src/middleware/errorHandler.ts
// -------------------------------
import { Request, Response, NextFunction } from "express";
import { buildError } from "../utils/envelope";


export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
    ) {
        console.error("Global error handler caught:", {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
        });

        const requestId = (req as any).requestId;

        const status = err.status || 500;
        const code = err.code || "GLOBAL_INTERNAL_ERROR";
        const message = err.message || "Unexpected global error";

        res.status(status).json(
            buildError(code, message, err.details || null, requestId)
        );
}
