import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../shared/http.js";
import { createEventsRepository } from "./events.repository.js";
import { validateMonth } from "./events.service.js";

const repository = createEventsRepository(pool);
export const eventsRouter = Router();

eventsRouter.get("/", asyncHandler(async (req, res) => {
    const month = validateMonth(req.query.month);
    res.json(await repository.listByMonth(month));
}));
