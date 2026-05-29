import "dotenv/config";
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

export function createPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString });
}
