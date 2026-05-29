import type { DashboardStats } from "../types";
import { apiRequest } from "./client";

export const statsApi = {
  get: () => apiRequest<DashboardStats>("/stats")
};