import type pg from "pg";

type Queryable = Pick<pg.Pool, "query">;

type StatsRow = {
  total_customers: string | number;
  month_events_count: string | number;
  total_interactions: string | number;
};

export type DashboardStats = {
  totalCustomers: number;
  monthEventsCount: number;
  totalInteractions: number;
};

export function createStatsRepository(db: Queryable) {
  return {
    async getDashboardStats(month: number): Promise<DashboardStats> {
      const result = await db.query<StatsRow>(
        `
          select
            (select count(*) from customers) as total_customers,
            (
              (select count(*) from customers where extract(month from ngay_thanh_lap) = $1)
              +
              (select count(*) from vips where extract(month from ngay_sinh) = $1)
            ) as month_events_count,
            (select count(*) from interactions) as total_interactions
        `,
        [month]
      );
      const row = result.rows[0];
      return {
        totalCustomers: Number(row?.total_customers ?? 0),
        monthEventsCount: Number(row?.month_events_count ?? 0),
        totalInteractions: Number(row?.total_interactions ?? 0)
      };
    }
  };
}
