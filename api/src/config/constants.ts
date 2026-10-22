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

// Source of truth for the self-update check (api/src/modules/updates). Not an env var on
// purpose: every install should check *this* project's releases, so this never varies by
// deployment, and a fork already has to hand-edit the hardcoded GitHub links in
// ui/web/about.php and ui/web/login.php -- editing this constant too is consistent with that.
export const GITHUB_REPO = "ds2600/autobk-controller";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 200;

const agentConfigPath = path.join(
    process.env.AGENT_DIR || ".",
    "autobk.ini"
);

const agentConfig = ini.parse(fs.readFileSync(agentConfigPath, "utf-8"));

export const BACKUP_HZ = parseInt(agentConfig.Tasks?.AutoBackupsHz || "0", 10);

// EAS report scripts (e.g. usr_autobk_version_OneNet.py) live alongside autobk.ini in the
// agent checkout, and write their CSV output to the [EAS] Directory the agent's own ini defines.
export const EAS_ONENET_SCRIPT = path.join(
    process.env.AGENT_DIR || ".",
    "usr_autobk_version_OneNet.py"
);
export const EAS_OUTPUT_DIR = agentConfig.EAS?.Directory || "";
