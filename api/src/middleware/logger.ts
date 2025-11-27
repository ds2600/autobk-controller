// -------------------------------
// src/middleware/logger.ts
// -------------------------------
import pinoHttp from "pino-http";
import pino from "pino";
import { env } from "../config/env";


export const requestLogger = pinoHttp({
logger: pino({ level: env.LOG_LEVEL }),
    customProps: (req) => ({ requestId: (req as any).requestId }),
});
