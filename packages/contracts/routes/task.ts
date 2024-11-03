import { initContract } from "@ts-rest/core";
import { baseSchema, ErrorResponse } from "../schemas";
import { z } from "zod";
import { imageSchema } from "./image";

const c = initContract();

export const computingOptionSchema = baseSchema.extend({
  id: z.string(),
  name: z.string(),
  availableCPU: z.number(),
  availableMemory: z.number(),
  costPerHour: z.number(),
});

export const storageOptionSchema = baseSchema.extend({
  id: z.string(),
  name: z.string(),
  storageSize: z.number(),
  costPerHour: z.number(),
});

const taskEnvironmentVariableSchema = baseSchema.extend({
  id: z.string(),
  key: z.string(),
  value: z.string(),
});

export const taskSchema = baseSchema.extend({
  id: z.string(),
  name: z.string(),
  arn: z.string(),
  revision: z.number(),
  taskRoleArn: z.string().nullable(),
  executionRoleArn: z.string().nullable(),
  launchType: z.string(),
  operatingSystem: z.string(),
  containerName: z.string(),
  containerPort: z.number(),
  containerPortProtocol: z.string(),
  exposedPort: z.number(),
  exposedPortProtocol: z.string(),

  userImage: imageSchema,
  userImageId: z.string(),

  computingOption: computingOptionSchema,
  computingOptionId: z.string(),

  storageOption: storageOptionSchema,
  storageOptionId: z.string(),

  taskEnvironmentVariable: taskEnvironmentVariableSchema.array(),
});

type CreateTaskResponse = z.infer<typeof taskSchema>;

export const listTaskResponse = taskSchema.array();
type ListTaskResponse = z.infer<typeof listTaskResponse>;

export const TaskContract = c.router({
  listTasks: {
    method: "GET",
    path: "/tasks",
    responses: {
      200: c.type<ListTaskResponse>(),
      404: c.type<ErrorResponse>(),
      500: c.type<ErrorResponse>(),
    },
    summary: "List tasks",
  },
  createTask: {
    method: "POST",
    path: "/tasks",
    responses: {
      201: c.type<CreateTaskResponse>(),
      400: c.type<ErrorResponse>(),
      404: c.type<ErrorResponse>(),
      500: c.type<ErrorResponse>(),
    },
    body: z.object({
      userId: z.string(),
      os: z.string(),
      computingOptionId: z.string(),
      storageOptionId: z.string(),
      userImageId: z.string(),
      portMapping: z.object({
        // Container Port
        containerPort: z.number(),
        containerPortProtocol: z.string(),
        // Exposed Port
        exposedPort: z.number(),
        exposedPortProtocol: z.string(),
      }),
      environmentVariables: z
        .object({
          key: z.string(),
          value: z.string(),
        })
        .array()
        .optional(),
    }),
    summary: "Create task",
  },
  deleteTask: {
    method: "DELETE",
    path: "/tasks/:id",
    responses: {
      204: c.type<void>(),
      404: c.type<ErrorResponse>(),
      500: c.type<ErrorResponse>(),
    },
    body: z.any().nullable(),
    summary: "Delete task",
  },
});