import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { baseSchema, ErrorResponse } from "../schemas";
import { userSchema } from "../schemas/user";
import { taskSchema } from "./task";

const c = initContract();

export const clusterSchema = baseSchema.extend({
  arn: z.string(),
  name: z.string(),
  namespace: z.string(),
  infrastructure: z.string(),
  ownerId: z.string(),
  owner: userSchema,
});

export const serviceSchema = baseSchema.extend({
  arn: z.string(),
  name: z.string(),
  publicIP: z.string(),
  publicPort: z.number(),
  providerBase: z.number().default(1),
  providerWeight: z.number().default(1),
  taskDefinition: taskSchema,
  taskDefinitionId: z.string(),
  cluster: clusterSchema,
  clusterId: z.string(),
});

type Service = z.infer<typeof serviceSchema>;

const listServiceResponse = serviceSchema.array();
export type ListServiceResponse = z.infer<typeof listServiceResponse>;

export const ServiceContract = c.router({
  listServices: {
    method: "GET",
    path: "/services",
    responses: {
      200: c.type<ListServiceResponse>(),
      404: c.type<ErrorResponse>(),
      500: c.type<ErrorResponse>(),
    },
    summary: "List services",
  },
  createService: {
    method: "POST",
    path: "/services",
    responses: {
      200: c.type<Service>(),
      400: c.type<ErrorResponse>(),
      404: c.type<ErrorResponse>(),
      500: c.type<ErrorResponse>(),
    },
    body: z.object({
      serviceName: z.string(),
      userId: z.string(),
      taskDefinitionId: z.string(),
      providerBase: z.number().default(1),
      providerWeight: z.number().default(1),
    }),
    summary: "Create service",
  },
  deleteService: {
    method: "DELETE",
    path: "/services/:id",
    responses: {
      204: c.type<null>(),
      404: c.type<ErrorResponse>(),
      500: c.type<ErrorResponse>(),
    },
    body: z.any().nullable(),
    summary: "Delete service",
  },
});
