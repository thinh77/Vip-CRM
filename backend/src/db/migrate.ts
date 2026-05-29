import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type pg from "pg";
import { pool } from "./pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "migrations");

export async function runMigrations(db: pg.Pool): Promise<void> {
  await db.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const alreadyApplied = await db.query(
      "select 1 from schema_migrations where filename = $1",
      [file]
    );
    if (alreadyApplied.rowCount) continue;

    const sql = await readFile(join(migrationsDir, file), "utf8");
    const client = await db.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations(filename) values ($1)", [file]);
      await client.query("commit");
      console.log(`Applied migration ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runMigrations(pool);
  await pool.end();
}
