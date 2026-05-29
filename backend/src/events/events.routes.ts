import { Router } from "express";
import { pool } from "../db/pool.js";
import { createCustomersRepository } from "../customers/customers.repository.js";
import { asyncHandler } from "../shared/http.js";
import { buildCareEvents, validateMonth } from "./events.service.js";

const repository = createCustomersRepository(pool);
export const eventsRouter = Router();

eventsRouter.get("/", asyncHandler(async (req, res) => {
    const month = validateMonth(req.query.month);
    const customers = await repository.list({});
    res.json(buildCareEvents(customers, month));
}));