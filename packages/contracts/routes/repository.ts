import {initContract} from "@ts-rest/core";
import {z} from "zod";
import {baseSchema, ErrorResponse} from "../schemas";
import {userSchema} from "../schemas/user";

const c = initContract();

const repositorySchema = baseSchema.extend({
    id: z.string(),
    name: z.string(),
    uri: z.string(),
    ownerId: z.string(),
    owner: userSchema
})
type Repository = z.infer<typeof repositorySchema>

const listRepositoryResponse = repositorySchema.array()
type ListRepositoryResponse = z.infer<typeof listRepositoryResponse>

export const RepositoryContract = c.router({
    listRepositories: {
        method: "GET",
        path: "/repositories",
        responses: {
            200: c.type<ListRepositoryResponse>(),
            500: c.type<ErrorResponse>()
        },
        summary: "List repositories",
    },
    createRepository: {
        method: "POST",
        path: "/repositories",
        responses: {
            201: c.type<Repository>(),
            400: c.type<ErrorResponse>(),
            500: c.type<ErrorResponse>()
        },
        body: z.object({
            name: z.string()
        }),
        summary: "Create a repository",
    }
})