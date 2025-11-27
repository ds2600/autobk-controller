// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { requestLogger } from "./middleware/logger";
import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./swagger/openapi";

// Routers
import infoRouter from "./modules/info/info.router";
import healthRouter from "./modules/health/health.router";
import authRouter from "./modules/auth/auth.router";
import usersRouter from "./modules/users/users.router";
import devicesRouter from "./modules/devices/devices.router";
import backupsRouter from "./modules/backups/backups.router";
import schedulesRouter from "./modules/schedules/schedules.router";
import settingsRouter from "./modules/settings/settings.router";
import reportsRouter from "./modules/reports/reports.router";
import auditRouter from "./modules/audit/audit.router";
import cacheRouter from "./modules/cache/cache.router";
import { API_VERSION } from "./config/constants";

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection🔥", {
        reason,
        reasonString: JSON.stringify(reason, null, 2),
    });
});

const app = express();

const apiVersion = API_VERSION;

// ------------------------------------------------------------
// Core Middleware
// ------------------------------------------------------------
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(requestId); // Inject requestId per request
app.use(requestLogger); // Log each request

// ------------------------------------------------------------
// Application Info 
// ------------------------------------------------------------
app.use("/v1/info", infoRouter);
app.use("/v1/cache", cacheRouter); 
app.use("/health", healthRouter);


// ------------------------------------------------------------
// API Routes
// ------------------------------------------------------------
app.use(`/${apiVersion}/auth`, authRouter);
app.use(`/${apiVersion}/users`, usersRouter);
app.use(`/${apiVersion}/devices`, devicesRouter);
app.use(`/${apiVersion}/backups`, backupsRouter);
app.use(`/${apiVersion}/schedules`, schedulesRouter);
app.use(`/${apiVersion}/settings`, settingsRouter);
app.use(`/${apiVersion}/reports`, reportsRouter);
app.use(`/${apiVersion}/audit`, auditRouter);

// ------------------------------------------------------------
// Swagger Documentation
// ------------------------------------------------------------
if (env.ENABLE_SWAGGER) {
    app.use(`/${apiVersion}/docs`, swaggerUi.serve, swaggerUi.setup(openapiSpec));
    app.get(`/${apiVersion}/openapi.json`, (_req, res) => res.json(openapiSpec));
}

// ------------------------------------------------------------
// Error Handler (final middleware)
// ------------------------------------------------------------
app.use(errorHandler);

export default app;

