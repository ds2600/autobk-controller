// ------------------------------------------------------------
// src/swagger/swagger.ts
// ------------------------------------------------------------
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./openapi";


// Export ready-to-use Swagger middleware bundle
export const swagger = {
    serve: swaggerUi.serve,
    setup: swaggerUi.setup(openapiSpec),
};
