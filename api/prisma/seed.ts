// prisma/seed.ts
import { PrismaClient, DeviceType, ScheduleState } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function seedAdminUser() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log("Seed: users already exist, skipping.");
    return;
  }

  const email = process.env.ADMIN_EMAIL || "admin@local";
  const displayName = process.env.ADMIN_NAME || "Administrator";
  const password = process.env.ADMIN_PASSWORD || "ChangeMeNOW_123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      displayName,
      passwordHash,
      role: "Administrator",
      isActive: true,
    },
  });

  console.log(`Seed: created admin user
  Email: ${email}
  Password: <redacted>`);
}

function randomIp(): string {
    const a = 10;
    const b = Math.floor(Math.random() * 256);
    const c = Math.floor(Math.random() * 256);
    const d = Math.floor(Math.random() * 256);
    return `${a}.${b}.${c}.${d}`;
}

function randomWeeks(): number {
    const options = [1, 1, 2, 2, 4, 8];
    return options[Math.floor(Math.random() * options.length)];
}

function createDevice(sName: string, sType: DeviceType, sIP: string, iAutoDay: number, iAutoHour: number, iAutoWeeks: number) {
    return prisma.device.create({
        data: {
            sName,
            sType,
            sIP,
            iAutoDay,
            iAutoHour,
            iAutoWeeks,
        } as any,
    });
}

async function seedDevices(count: number) {
    if (count <= 0) return;

    const existing = await prisma.device.count();
    if (existing > 0) {
        await prisma.backup.deleteMany();
        await prisma.schedule.deleteMany();
        await prisma.device.deleteMany();

        console.log("Seed: devices already exist, deleting.");
    }
    console.log(`Seed: creating ${count} devices (existing: ${existing})`);

    const allTypes = Object.values(DeviceType);
    const excluded = ["OneNetLog"];
    const types = allTypes.filter((t) => !excluded.includes(t));

    if (!types.length) {
        console.warn("Seed: no device types available for seeding.");
        return;
    }

    for (let i = 0; i < count; i++) {
        let isOneNet = false;
        const sType = types[Math.floor(Math.random() * types.length)];
        const index = existing + i + 1;
        const padded = String(index).padStart(3, "0");

        const sName = `${sType}-${padded}`;
        const sIP = randomIp();

        const iAutoDay = Math.floor(Math.random() * 8);
        const iAutoHour = Math.floor(Math.random() * 24);
        const iAutoWeeks = randomWeeks();
        if (sType === "OneNet") {
            isOneNet = true;
        }
        await createDevice(sName, sType, sIP, iAutoDay, iAutoHour, iAutoWeeks); 
        if (isOneNet) {
            await createDevice(`${sName}-Log`, "OneNetLog", sIP, iAutoDay, iAutoHour, 8);
        }
    }
    console.log(`Seed: created ${count} devices. Don't forget to seed test data with --seed-test-data if needed.`);
}

function getDeviceSeedCount(): number {
    const arg = process.argv.slice(2).find((a) => a.startsWith("--devices="));
    if (!arg) return 0;

    const [, value] = arg.split("=");
    const n = parseInt(value, 10);
    if (Number.isNaN(n) || n <= 0) {
        console.warn(`Seed: invalid device count '${value}', skipping device seeding.`);
        return 0;
    }
    return n;
}

function shouldSeedTestData(): boolean {
    return process.argv.slice(2).some((a) => a === "--seed-test-data");
}

function shouldCreateAdminUser(): boolean {
    return process.argv.slice(2).some((a) => a === "--create-admin-user");
}

async function seedTestBackupsAndSchedules() {
    const devices = await prisma.device.findMany();

    if (devices.length === 0) {
        console.log("Seed: no devices found, skipping backup/schedule seeding.");
        return;
    }

    const backupDir = process.env.BACKUP_FILES_DIR || "./backups";

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    console.log("Seed: clearing existing Backup and Schedule data...");
    await prisma.backup.deleteMany();
    await prisma.schedule.deleteMany();

    console.log("Seed: creating fake backups and schedules for testing...");
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let totalBackups = 0;
    let totalSchedules = 0;
    let totalFailures = 0;

    for (const device of devices) {
        let lastBackupComplete: Date | null = null;
        const backupCount = Math.floor(Math.random() * 6);
        for (let i = 0; i < backupCount; i++) {
            const offsetMs = Math.floor(Math.random() * oneDayMs);
            const tComplete = new Date(now.getTime() - offsetMs);
            const tExpires = new Date(tComplete.getTime() + device.iAutoWeeks * 7 * oneDayMs);

            const fileSafeTimestamp = tComplete.toISOString().replace(/[:.]/g, "-");

            const sFile = `${device.sName}_backup_${fileSafeTimestamp}.cfg`;

            const deviceDirName = device.kSelf.toString().padStart(10, "0");
            const deviceDirPath = path.join(backupDir, deviceDirName);

            if (!lastBackupComplete || tComplete > lastBackupComplete) {
                lastBackupComplete = tComplete;
            }

            await prisma.backup.create({
                data: {
                    kDevice: device.kSelf,
                    tComplete,
                    tExpires,
                    sFile,
                    sComment: `Seeded backup #${i + 1}`,
                },
            });
            totalBackups++;

            if (!fs.existsSync(deviceDirPath)) {
                fs.mkdirSync(deviceDirPath, { recursive: true });
            }

            const filepath = path.join(deviceDirPath, sFile);
            if (!fs.existsSync(filepath)) {
                fs.writeFileSync(filepath, `This is a seeded backup file for device ${device.sName}, created at ${tComplete.toISOString()}\n`, "utf8");
            }
        }

        const scheduleCount = Math.floor(Math.random() * 4);
        for (let i = 0; i < scheduleCount; i++) {
            const offsetMs = Math.floor(Math.random() * oneDayMs);
            let tTime = new Date(now.getTime() - offsetMs);

            let sState: ScheduleState;
            const r = Math.random();
            if (r < 0.05) sState = ScheduleState.Fail;
            else if (r < 0.45) sState = ScheduleState.Auto;
            else if (r < 0.9) sState = ScheduleState.Complete;
            else sState = ScheduleState.Manual;

            if (sState === ScheduleState.Auto && lastBackupComplete) {
                const weeksMs = device.iAutoWeeks * 7 * oneDayMs;
                tTime = new Date(lastBackupComplete.getTime() + weeksMs);
            }

            if (sState === ScheduleState.Fail) {
                totalFailures++;
            }

            await prisma.schedule.create({
                data: {
                    kDevice: device.kSelf,
                    sState,
                    tTime,
                    iAttempt: 1,
                    sComment:
                        sState === ScheduleState.Fail
                            ? `Seeded failed schedule #${i + 1}`
                            : `Seeded successful schedule #${i + 1}`,
                
                },
            });
            totalSchedules++;
        }

        console.log(`Seed: created ${backupCount} backups and ${scheduleCount} schedules for device ${device.sName}.`);
    }

}


async function main() {
    if (shouldCreateAdminUser()) {
        await seedAdminUser();
    } else {
        console.log("Seed: Skipping admin user creation.");
    }

    const deviceCount = getDeviceSeedCount();
    if (deviceCount > 0) {
        await seedDevices(deviceCount);
    } else {
        console.log("Seed: no devices to create, skipping device seeding.");
    }

    if (shouldSeedTestData()) {
        await seedTestBackupsAndSchedules();
    } else {
        console.log("Seed: skipping test backup/schedule seeding.");
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

