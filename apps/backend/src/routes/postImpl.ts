import { initServer, type AppRouteImplementation } from "@ts-rest/express";

// Contracts
import { contract } from "@repo/contracts";

const s = initServer();

const getPost: AppRouteImplementation<typeof contract.post.getPost> = async ({
  params: { id },
}) => {
  return {
    status: 200,
    body: "Sample Post Ja: " + id,
  };
};

const createPost: AppRouteImplementation<typeof contract.post.createPost> = async ({ body }) => {
  return {
    status: 201,
    body: { ...body, id: "123" },
  };
};

const postRouter = s.router(contract, {
  post: {
    getPost,
    createPost,
  },
});

export default postRouter;
