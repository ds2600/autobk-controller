// -------------------------------
// src/middleware/requestId.ts
// -------------------------------
import { v4 as uuid } from "uuid";
import { Request, Response, NextFunction } from "express";


export function requestId(req: Request, _res: Response, next: NextFunction) {
    (req as any).requestId = uuid();
    next();
}
