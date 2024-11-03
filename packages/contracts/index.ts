// contract.ts

import { initContract } from "@ts-rest/core";

// Routes
import { PostContract } from "./routes/post";
import { RepositoryContract } from "./routes/repository";
import { ImageContract } from "./routes/image";
import { TaskContract } from "./routes/task";

const c = initContract();

export const contract = c.router({
  post: PostContract,
  repository: RepositoryContract,
  image: ImageContract,
  task: TaskContract,
});
