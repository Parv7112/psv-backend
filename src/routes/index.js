import { Router } from "express";
import { healthRouter } from "./health.js";
import { leadRouter } from "./lead.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/leads", leadRouter);

