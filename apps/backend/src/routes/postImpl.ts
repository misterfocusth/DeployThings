import { initServer, type AppRouteImplementation } from "@ts-rest/express";

// Contracts
import { contract } from "@repo/contracts";

const s = initServer();

const getPost: AppRouteImplementation<typeof contract.getPost> = async ({ params: { id } }) => {
  return {
    status: 200,
    body: "Sample Post Ja: " + id,
  };
};

const createPost: AppRouteImplementation<typeof contract.createPost> = async ({ body }) => {
  return {
    status: 201,
    body: { ...body, id: "123" },
  };
};

const postRouter = s.router(contract, {
  getPost,
  createPost,
});

export default postRouter;
