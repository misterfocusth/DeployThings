// contract.ts

import { initContract } from "@ts-rest/core";
import { string, z } from "zod";

const c = initContract();

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
});

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
      200: string(),
    },
    summary: "Get a post by id",
  },
});
