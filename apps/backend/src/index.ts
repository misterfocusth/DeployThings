import "../../../loadEnv";

import { createExpressEndpoints } from "@ts-rest/express";

// Router
import postImpl from "./routes/postImpl";

import express, { Express } from "express";
import cors from "cors";

export const app: Express = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create Express Endpoints
createExpressEndpoints(postImpl.contract, postImpl.router, app);

const port = process.env.BACKEND_PORT || 3000;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
