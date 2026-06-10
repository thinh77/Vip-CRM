import assert from "node:assert/strict";
import { test } from "node:test";
import { createStatsRepository } from "./stats.repository.js";

test("getDashboardStats returns all counters with one aggregate query", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const db = {
    query: async (text: string, values?: unknown[]) => {
      queries.push({ text, values });
      return {
        rows: [{
          total_customers: "12",
          month_events_count: "7",
          total_interactions: "34"
        }]
      };
    }
  };
  const repository = createStatsRepository(db as never);

  const stats = await repository.getDashboardStats(5);

  assert.deepEqual(stats, {
    totalCustomers: 12,
    monthEventsCount: 7,
    totalInteractions: 34
  });
  assert.equal(queries.length, 1);
  assert.deepEqual(queries[0].values, [5]);
});
