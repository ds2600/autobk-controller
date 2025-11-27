// ------------------------------------------------------------
// src/middleware/validate.ts
// ------------------------------------------------------------
import { Request, Response, NextFunction } from "express";


export function validate(schema: any) {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err: any) {
            next({ status: 400, code: "VALIDATION_ERROR", message: err.message });
        }
    };
}

export function validateQuery(schema: any) {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (err: any) {
            next({ status: 400, code: "VALIDATION_ERROR", message: err.message });
        }
    };
}
