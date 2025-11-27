// ------------------------------------------------------------
// src/modules/schedules/schedules.controller.ts
// ------------------------------------------------------------
import { Request, Response } from "express";
import { schedulesService } from "./schedules.service";
import { buildSuccess } from "../../utils/envelope";


export const schedulesController = {
async list(req: Request, res: Response) {
const deviceId = req.query.deviceId ? Number(req.query.deviceId) : undefined;
const schedules = await schedulesService.listSchedules(deviceId);
res.json(buildSuccess(schedules, (req as any).requestId));
},


async get(req: Request, res: Response) {
const id = Number(req.params.id);
const schedule = await schedulesService.getSchedule(id);
res.json(buildSuccess(schedule, (req as any).requestId));
},


async create(req: Request, res: Response) {
const reqMeta = {
actorUserId: (req as any).user?.userId,
requestId: (req as any).requestId,
ip: req.ip,
userAgent: req.headers["user-agent"] || null,
};


const schedule = await schedulesService.createSchedule(req.body, reqMeta);
res.json(buildSuccess(schedule, reqMeta.requestId));
},


async update(req: Request, res: Response) {
const id = Number(req.params.id);
const reqMeta = {
actorUserId: (req as any).user?.userId,
requestId: (req as any).requestId,
ip: req.ip,
userAgent: req.headers["user-agent"] || null,
};


const schedule = await schedulesService.updateSchedule(id, req.body, reqMeta);
res.json(buildSuccess(schedule, reqMeta.requestId));
},


async delete(req: Request, res: Response) {
const id = Number(req.params.id);
const reqMeta = {
actorUserId: (req as any).user?.userId,
requestId: (req as any).requestId,
ip: req.ip,
userAgent: req.headers["user-agent"] || null,
};


const result = await schedulesService.deleteSchedule(id, reqMeta);
res.json(buildSuccess(result, reqMeta.requestId));
},
};
