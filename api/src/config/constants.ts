// ------------------------------------------------------------
// src/config/constants.ts
// ------------------------------------------------------------

import fs from "fs";
import path from "path";
import ini from "ini";

export const VERSION = fs.readFileSync(
    path.join(__dirname, "../../../", "VERSION"),
    "utf-8"
).trim();

export const ROLES = {
    ADMIN: "Administrator",
    USER: "User",
    BASIC: "Basic",
} as const;

export const API_VERSION = "v1";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 200;

const agentConfigPath = path.join(
    process.env.AGENT_DIR || ".",
    "autobk.ini"
);

const agentConfig = ini.parse(fs.readFileSync(agentConfigPath, "utf-8"));

export const BACKUP_HZ = parseInt(agentConfig.Tasks?.AutoBackupsHz || "0", 10);
