// contract.ts

import { initContract } from "@ts-rest/core";

// Routes
import { PostContract } from "./routes/post";

const c = initContract();

export const contract = c.router({
  post: PostContract,
});
