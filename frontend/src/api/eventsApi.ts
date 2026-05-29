import type { CareEvent } from "../types";
import { apiRequest } from "./client";

export const eventsApi = {
  listByMonth: (month: number) => apiRequest<CareEvent[]>(`/events?month=${month}`)
};