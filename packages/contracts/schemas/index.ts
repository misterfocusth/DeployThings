import {z} from "zod";

export const baseSchema = z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export const errorResponse = z.object({
    error: z.string()
})

export type ErrorResponse = z.infer<typeof errorResponse>