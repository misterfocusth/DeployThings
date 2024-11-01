import {initContract} from "@ts-rest/core";
import {baseSchema, ErrorResponse} from "../schemas";
import {z} from "zod";
import {userSchema} from "../schemas/user";
import {repositorySchema} from "./repository";

const c = initContract();

export const imageSchema = baseSchema.extend({
    id: z.string(),
    imageName: z.string(),
    imageTag: z.string(),
    pushedAt: z.date(),
    size: z.number(),
    digest: z.string(),

    userId: z.string(),
    user: userSchema,

    repositoryId: z.string(),
    repository: repositorySchema.omit({owner: true})
})
type CreateImageResponse = z.infer<typeof imageSchema>

export const listImageResponse = imageSchema.array()
type ListImageResponse = z.infer<typeof listImageResponse>

export const ImageContract = c.router({
    listImages: {
        method: "GET",
        path: "/images",
        responses: {
            200: c.type<ListImageResponse>(),
            404: c.type<ErrorResponse>(),
            500: c.type<ErrorResponse>()
        },
        summary: "List images",
    },
    listUserImages: {
        method: "GET",
        path: "/images/:userId",
        responses: {
            200: c.type<ListImageResponse>(),
            404: c.type<ErrorResponse>()
        },
        summary: "List user images",
    },
    pullAndUploadImage: {
        method: "POST",
        path: "/images",
        responses: {
            201: c.type<CreateImageResponse>(),
            400: c.type<ErrorResponse>(),
            404: c.type<ErrorResponse>(),
            500: c.type<ErrorResponse>()
        },
        body: z.object({
            imageName: z.string(),
            userId: z.string(),
        }),
        summary: "Pull and upload image to ecr repository",
    }
})