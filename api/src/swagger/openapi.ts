// src/swagger/openapi.ts
import { OpenAPIV3 } from "openapi-types";
import { VERSION } from "../config/constants";

export const openapiSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "AutoBk Controller API",
    version: VERSION ?? "0.1.0",
    description:
      "Express + TypeScript + Prisma API for AutoBK. JWT bearer auth. All responses wrap { success, data, error, meta }.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Info" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Devices" },
    { name: "Backups" },
    { name: "Schedules" },
    { name: "Settings" },
    { name: "Reports" },
    { name: "Audit" },
    { name: "Cache" },
  ],
  security: [{ bearerAuth: [] }],
  paths: {
    "/info": {
      get: {
        tags: ["Info"],
        summary: "Get application info",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Info" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/LoginResponse" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            loggedOut: { type: "boolean" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user summary",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            email: { type: "string" },
                            role: { $ref: "#/components/schemas/UserRole" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 25 },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create user (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUser" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/users/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["Users"],
        summary: "Get user by ID (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUser" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    { type: "object", properties: { data: { type: "object" } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/devices": {
      get: {
        tags: ["Devices"],
        summary: "List devices",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Device" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Devices"],
        summary: "Create device",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDevice" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Device" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/devices/summary": {
      get: {
        tags: ["Devices"],
        summary: "Get device summary",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { type: "object", additionalProperties: true },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/devices/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["Devices"],
        summary: "Get device by ID",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Device" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Devices"],
        summary: "Update device",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateDevice" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Device" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Devices"],
        summary: "Delete device",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    { type: "object", properties: { data: { type: "object" } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/backups": {
      get: {
        tags: ["Backups"],
        summary: "List backups",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "deviceId",
            in: "query",
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Backup" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Backups"],
        summary: "Create backup record",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBackup" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Backup" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/backups/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["Backups"],
        summary: "Get backup by ID",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Backup" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Backups"],
        summary: "Update backup",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateBackup" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Backup" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Backups"],
        summary: "Delete backup",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    { type: "object", properties: { data: { type: "object" } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/backups/{id}/download": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["Backups"],
        summary: "Download backup file",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "File stream",
            content: { "application/octet-stream": {} },
          },
          "404": { description: "Not found" },
        },
      },
    },
    "/schedules": {
      get: {
        tags: ["Schedules"],
        summary: "List schedules",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "deviceId", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Schedule" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Schedules"],
        summary: "Create schedule",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSchedule" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Schedule" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/schedules/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      get: {
        tags: ["Schedules"],
        summary: "Get schedule by ID",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Schedule" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Schedules"],
        summary: "Update schedule",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateSchedule" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Schedule" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Schedules"],
        summary: "Delete schedule",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    { type: "object", properties: { data: { type: "object" } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/settings": {
      get: {
        tags: ["Settings"],
        summary: "List settings (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/AppSetting" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/settings/{key}": {
      parameters: [
        { name: "key", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        tags: ["Settings"],
        summary: "Get setting by key (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AppSetting" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Settings"],
        summary: "Update setting by key (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateSetting" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AppSetting" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/reports/recent": {
      get: {
        tags: ["Reports"],
        summary: "Recent backups",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "days",
            in: "query",
            schema: { type: "integer", default: 7, minimum: 1, maximum: 90 },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { type: "array", items: { type: "object" } },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/reports/failures": {
      get: {
        tags: ["Reports"],
        summary: "Backup failures",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "days",
            in: "query",
            schema: { type: "integer", default: 7, minimum: 1, maximum: 90 },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: { type: "array", items: { type: "object" } },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/audit": {
      get: {
        tags: ["Audit"],
        summary: "List audit logs (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 50 },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/AuditLog" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/cache/flush": {
      get: {
        tags: ["Cache"],
        summary: "Flush application cache",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/EnvelopeSuccess" },
                    { type: "object", properties: { data: { type: "object" } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      EnvelopeSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", /* OAS3 may ignore const */ },
          data: {},
          error: { nullable: true },
          meta: {
            type: "object",
            properties: {
              requestId: { type: ["string", "null"] as any }, // OpenAPI typings don't accept union here; cast.
              timestamp: { type: "string", format: "date-time" },
            },
            additionalProperties: true,
          },
        },
        required: ["success", "data", "error", "meta"],
      },
      EnvelopeError: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { nullable: true },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {},
            },
            required: ["code", "message"],
          },
          meta: { type: "object" },
        },
        required: ["success", "data", "error", "meta"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
        },
        required: ["email", "password"],
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              email: { type: "string", format: "email" },
              role: {
                type: "string",
                enum: ["Administrator", "User", "Basic"],
              },
              displayName: { type: "string" },
              isActive: { type: "boolean" },
              isDailyReportEnabled: { type: "boolean" },
            },
          },
        },
        required: ["token"],
      },
      Info: {
        type: "object",
        properties: {
          version: { type: "string" },
          uptime: { type: "number" },
          node: { type: "string" },
          platform: { type: "string" },
          arch: { type: "string" },
          cpuCount: { type: "integer" },
          totalMemory: { type: "integer" },
          freeMemory: { type: "integer" },
          totalStorage: { type: "integer" },
          freeStorage: { type: "integer" },
          hostname: { type: "string" },
          environment: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      DeviceType: {
        type: "string",
        enum: [
          "APEX",
          "DCM",
          "CAP",
          "Inca1",
          "Vista",
          "OneNet",
          "OneNetLog",
          "TC600E",
          "CXCHP",
          "PSSend",
          "Quartet",
          "Inca2",
        ],
      },
      ScheduleState: {
        type: "string",
        enum: ["Auto", "Manual", "Fail", "Complete"],
      },
      UserRole: {
        type: "string",
        enum: ["Administrator", "User", "Basic"],
      },
      Device: {
        type: "object",
        properties: {
          kSelf: { type: "integer" },
          sName: { type: "string" },
          sType: { $ref: "#/components/schemas/DeviceType" },
          sIP: { type: "string" },
          iAutoDay: { type: "integer" },
          iAutoHour: { type: "integer" },
          iAutoWeeks: { type: "integer" },
          Backups: {
            type: "array",
            items: { $ref: "#/components/schemas/Backup" },
          },
          Schedules: {
            type: "array",
            items: { $ref: "#/components/schemas/Schedule" },
          },
        },
        additionalProperties: false,
      },
      Backup: {
        type: "object",
        properties: {
          kSelf: { type: "integer" },
          kDevice: { type: "integer" },
          tComplete: { type: "string", format: "date-time" },
          tExpires: { type: "string", format: "date-time", nullable: true },
          sFile: { type: "string" },
          sComment: { type: "string", nullable: true },
          Device: { type: "object" },
        },
        additionalProperties: false,
      },
      Schedule: {
        type: "object",
        properties: {
          kSelf: { type: "integer" },
          kDevice: { type: "integer" },
          sState: { $ref: "#/components/schemas/ScheduleState" },
          tTime: { type: "string", format: "date-time" },
          iAttempt: { type: "integer", nullable: true },
          sComment: { type: "string", nullable: true },
          Device: { type: "object" },
        },
        additionalProperties: false,
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          passwordHash: { type: "string" },
          salt: { type: "string" },
          displayName: { type: "string", nullable: true },
          role: { $ref: "#/components/schemas/UserRole" },
          isActive: { type: "boolean" },
          isDailyReportEnabled: { type: "boolean", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          AuditLogs: {
            type: "array",
            items: { $ref: "#/components/schemas/AuditLog" },
          },
        },
        additionalProperties: false,
      },
      PasswordReset: {
        type: "object",
        properties: {
          id: { type: "integer" },
          token: { type: "string" },
          userId: { type: "integer" },
          expiresAt: { type: "string", format: "date-time" },
          usedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          User: { type: "object" },
        },
        additionalProperties: false,
      },
      AuditLog: {
        type: "object",
        properties: {
          id: { type: "integer" },
          actorUserId: { type: "integer", nullable: true },
          action: { type: "string" },
          resourceType: { type: "string" },
          resourceId: { type: "string" },
          before: { type: "object", nullable: true },
          after: { type: "object", nullable: true },
          ip: { type: "string", nullable: true },
          userAgent: { type: "string", nullable: true },
          requestId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          User: { type: "object", nullable: true },
        },
        additionalProperties: false,
      },
      AppSetting: {
        type: "object",
        properties: {
          key: { type: "string" },
          value: { type: "string", nullable: true },
          updatedAt: { type: "string", format: "date-time" },
          updatedBy: { type: "integer", nullable: true },
          User: { type: "object", nullable: true },
        },
        additionalProperties: false,
      },
      CreateUser: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          displayName: { type: "string" },
          role: { $ref: "#/components/schemas/UserRole" },
          isActive: { type: "boolean" },
          isDailyReportEnabled: { type: "boolean" },
        },
        required: ["email", "password", "role"],
      },
      UpdateUser: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          displayName: { type: "string" },
          role: { $ref: "#/components/schemas/UserRole" },
          isActive: { type: "boolean" },
          isDailyReportEnabled: { type: "boolean" },
        },
      },
      CreateDevice: {
        type: "object",
        properties: {
          sName: { type: "string", minLength: 1 },
          sType: { $ref: "#/components/schemas/DeviceType" },
          sIP: { type: "string" },
          iAutoDay: { type: "integer", minimum: 0, maximum: 7 },
          iAutoHour: { type: "integer", minimum: 0, maximum: 23 },
          iAutoWeeks: { type: "integer", minimum: 1 },
        },
        required: [
          "sName",
          "sType",
          "sIP",
          "iAutoDay",
          "iAutoHour",
          "iAutoWeeks",
        ],
      },
      UpdateDevice: {
        type: "object",
        properties: {
          sName: { type: "string" },
          sType: { $ref: "#/components/schemas/DeviceType" },
          sIP: { type: "string" },
          iAutoDay: { type: "integer", minimum: 0, maximum: 7 },
          iAutoHour: { type: "integer", minimum: 0, maximum: 23 },
          iAutoWeeks: { type: "integer", minimum: 1 },
        },
      },
      CreateBackup: {
        type: "object",
        properties: {
          kDevice: { type: "integer", minimum: 1 },
          tComplete: { type: "string", format: "date-time" },
          tExpires: { type: "string", format: "date-time", nullable: true },
          sFile: { type: "string" },
          sComment: { type: "string" },
        },
        required: ["kDevice", "tComplete", "sFile"],
      },
      UpdateBackup: {
        type: "object",
        properties: {
          tExpires: { type: "string", format: "date-time", nullable: true },
          sComment: { type: "string" },
        },
      },
      CreateSchedule: {
        type: "object",
        properties: {
          kDevice: { type: "integer", minimum: 1 },
          sState: { $ref: "#/components/schemas/ScheduleState" },
          tTime: { type: "string", format: "date-time" },
          iAttempt: { type: "integer" },
          sComment: { type: "string" },
        },
        required: ["kDevice", "tTime"],
      },
      UpdateSchedule: {
        type: "object",
        properties: {
          sState: { $ref: "#/components/schemas/ScheduleState" },
          tTime: { type: "string", format: "date-time" },
          iAttempt: { type: "integer" },
          sComment: { type: "string" },
        },
      },
      UpdateSetting: {
        type: "object",
        properties: { value: { type: "string", nullable: true } },
      },
    },
  },
};

