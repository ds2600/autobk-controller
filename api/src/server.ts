// src/server.ts
import { createServer } from "http";
import app from "./app";
import { env } from "./config/env";
import pino from "pino";

const port = env.PORT;
const logger = pino();

const server = createServer(app);

server.listen(port, () => {
  logger.info(`AutoBK API server running on port ${port}`);
});

