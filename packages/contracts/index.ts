// contract.ts

import {initContract} from "@ts-rest/core";

// Routes
import {PostContract} from "./routes/post";
import {RepositoryContract} from "./routes/repository";

const c = initContract();

export const contract = c.router({
  post: PostContract,
  repository: RepositoryContract
});
