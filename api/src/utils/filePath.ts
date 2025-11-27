// -------------------------------
// src/utils/filePath.ts
// -------------------------------
import path from "path";
import fs from "fs";
import { env } from "../config/env";
import { buildError } from "./envelope";


export function resolveBackupFile(deviceId: number, filename: string) {
    const padded = deviceId.toString().padStart(10, "0");


    // base/deviceId/filename
    const fullPath = path.join(env.BACKUP_FILES_DIR, padded, filename);


    // Prevent path traversal
    const safeRoot = path.resolve(env.BACKUP_FILES_DIR);
    const resolved = path.resolve(fullPath);
    if (!resolved.startsWith(safeRoot)) {
        throw Object.assign(new Error("Path traversal detected"), {
            status: 400,
            code: "INVALID_PATH",
        });
    }


    if (!fs.existsSync(resolved)) {
        throw Object.assign(new Error("Backup file not found"), {
            status: 404,
            code: "BACKUP_FILE_MISSING",
        });
    }

    return resolved;
}
