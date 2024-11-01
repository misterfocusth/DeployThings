import {type AppRouteImplementation} from "@ts-rest/express";

// Contracts
import {contract} from "@repo/contracts";

export const getPost: AppRouteImplementation<typeof contract.post.getPost> = async ({
  params: { id },
}) => {
    console.log(id)
    const posts = [
        {
            id: "1",
            title: "Sample Post",
            body: "This is a sample post",
        },
        {
            id: "2",
            title: "Sample Post 2",
            body: "This is a sample post 2",
        }
    ]
  return {
    status: 200,
      body: posts
  };
};

export const createPost: AppRouteImplementation<typeof contract.post.createPost> = async ({body}) => {
  return {
    status: 201,
    body: { ...body, id: "123" },
  };
};