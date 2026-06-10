import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../shared/http.js";
import { createStatsRepository } from "./stats.repository.js";

const repository = createStatsRepository(pool);
export const statsRouter = Router();

statsRouter.get("/", asyncHandler(async (_req, res) => {
    res.json(await repository.getDashboardStats(new Date().getMonth() + 1));
}));
