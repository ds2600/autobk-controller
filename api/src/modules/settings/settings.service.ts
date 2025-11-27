// ------------------------------------------------------------
// src/modules/settings/settings.service.ts
// ------------------------------------------------------------
import { prisma } from "../../db/prisma";
import { writeAuditLog } from "../../utils/audit";


export const settingsService = {
async listSettings() {
return prisma.appSetting.findMany({ orderBy: { key: "asc" } });
},


async getSetting(key: string) {
const setting = await prisma.appSetting.findUnique({ where: { key } });
if (!setting)
throw {
status: 404,
code: "SETTING_NOT_FOUND",
message: "Setting not found",
};
return setting;
},


async updateSetting(key: string, value: any, reqMeta: any) {
const before = await prisma.appSetting.findUnique({ where: { key } });


const setting = await prisma.appSetting.upsert({
where: { key },
update: { value, updatedBy: reqMeta.actorUserId },
create: { key, value, updatedBy: reqMeta.actorUserId },
});


await writeAuditLog({
actorUserId: reqMeta.actorUserId,
action: "update",
resourceType: "Setting",
resourceId: key,
before,
after: setting,
...reqMeta,
});


return setting;
},
};
