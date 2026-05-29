import { Router } from "express";
import { pool } from "../db/pool.js";
import { createCustomersRepository } from "../customers/customers.repository.js";
import { asyncHandler } from "../shared/http.js";
import { buildStats } from "./stats.service.js";

const repository = createCustomersRepository(pool);
export const statsRouter = Router();

statsRouter.get("/", asyncHandler(async (_req, res) => {
    const customers = await repository.list({});
    res.json(buildStats(customers));
}));