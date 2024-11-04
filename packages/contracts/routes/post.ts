// contract.ts

import {initContract} from "@ts-rest/core";
import {z} from "zod";

const c = initContract();

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
});

const getPostResponse = PostSchema.array()
type GetPostResponse = z.infer<typeof getPostResponse>

export const PostContract = c.router({
  createPost: {
    method: "POST",
    path: "/posts",
    responses: {
      201: PostSchema,
    },
    body: z.object({
      title: z.string(),
      body: z.string(),
    }),
    summary: "Create a post",
  },
  getPost: {
    method: "GET",
    path: `/posts/:id`,
    responses: {
      200: c.type<GetPostResponse>()
    },
    summary: "Get a post by id",
  },
});
