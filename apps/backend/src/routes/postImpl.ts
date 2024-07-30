import { initServer, type AppRouteImplementation } from "@ts-rest/express";

// Contracts
import { PostContract } from "@repo/contracts";

const s = initServer();

const getPost: AppRouteImplementation<typeof PostContract.getPost> = async ({ params: { id } }) => {
  return {
    status: 200,
    body: "Sample Post Ja: " + id,
  };
};

const createPost: AppRouteImplementation<typeof PostContract.createPost> = async ({ body }) => {
  return {
    status: 201,
    body: { ...body, id: "123" },
  };
};

const postRouter = s.router(PostContract, {
  getPost,
  createPost,
});

export default {
  contract: PostContract,
  router: postRouter,
};
