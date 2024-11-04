import "../../../loadEnv";

import { createExpressEndpoints, initServer } from "@ts-rest/express";

// Router
import { createPost, getPost } from "./routes/postImpl";

import express, { Express } from "express";
import cors from "cors";
import { contract } from "@repo/contracts";
import { createRepository, deleteRepository, listRepositories } from "./routes/repositoryImpl";
import { listImages, listUserImages, pullAndUploadImage } from "./routes/imageImpl";
import { createTask, deleteTask, listTasks } from "./routes/taskImpl";
import { createService, deleteService, listServices } from "./routes/serviceImpl";

export const app: Express = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const s = initServer();

const router = s.router(contract, {
  post: {
    getPost: getPost,
    createPost: createPost,
  },
  repository: {
    listRepositories: listRepositories,
    createRepository: createRepository,
    deleteRepository: deleteRepository,
  },
  image: {
    listImages: listImages,
    listUserImages: listUserImages,
    pullAndUploadImage: pullAndUploadImage,
  },
  task: {
    listTasks: listTasks,
    createTask: createTask,
    deleteTask: deleteTask,
  },
  service: {
    listServices: listServices,
    createService: createService,
    deleteService: deleteService,
  },
});

// Create Express Endpoints
createExpressEndpoints(contract, router, app);

const port = process.env.BACKEND_PORT || 3000;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
