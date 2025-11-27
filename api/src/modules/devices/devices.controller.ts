
// ------------------------------------------------------------
// src/modules/devices/devices.controller.ts
// ------------------------------------------------------------
import { Request, Response, NextFunction } from "express";
import { devicesService } from "./devices.service";
import { buildSuccess } from "../../utils/envelope";
import { z } from "zod";
import { DeviceType } from "@prisma/client";

export const devicesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const devices = await devicesService.listDevices();
      res.json(buildSuccess(devices, (req as any).requestId));
    } catch (err) {
      next(err);
    }
  },

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const qp = z
        .object({
          page: z.coerce.number().int().min(1).optional(),
          pageSize: z.coerce.number().int().min(1).max(100).optional(),
          search: z.string().optional(),
        })
        .parse(req.query);

      const { page = 1, pageSize = 25, search = '' } = qp;  

      const { data, meta } = await devicesService.listDeviceSummaries(page, pageSize, search);

      res.json(
          buildSuccess(
              data, 
              (req as any).requestId,
              meta
          )
      );
    } catch (err: any) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const device = await devicesService.getDevice(id);
      res.json(buildSuccess(device, (req as any).requestId));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const reqMeta = {
        actorUserId: (req as any).user?.userId,
        requestId: (req as any).requestId,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || null,
      };

      const device = await devicesService.createDevice(req.body, reqMeta);
      res.json(buildSuccess(device, reqMeta.requestId));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const reqMeta = {
        actorUserId: (req as any).user?.userId,
        requestId: (req as any).requestId,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || null,
      };

      const device = await devicesService.updateDevice(id, reqMeta ? req.body : req.body, reqMeta);
      res.json(buildSuccess(device, reqMeta.requestId));
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const reqMeta = {
        actorUserId: (req as any).user?.userId,
        requestId: (req as any).requestId,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || null,
      };

      const removed = await devicesService.deleteDevice(id, reqMeta);
      res.json(buildSuccess(removed, reqMeta.requestId));
    } catch (err) {
      next(err);
    }
  },

  async getTypes(req: Request, res: Response, next: NextFunction) {
      try {
          const types = Object.values(DeviceType);
          res.json(buildSuccess(types, (req as any).requestId));
      } catch (err) {
          next(err);
      }
  },
};

