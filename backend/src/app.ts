import cors from "cors";
import express from "express";
import { errorMiddleware } from "./shared/http.js";
import { customersRouter } from "./customers/customers.routes.js";

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/customers", customersRouter);

app.use(errorMiddleware);
