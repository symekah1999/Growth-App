import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Create a Neon project, copy its connection string into .env.local, and see README.md.",
  );
}

const sql = neon(process.env.DATABASE_URL);

// Single shared Drizzle client, backed by Neon's HTTP driver (works great in
// serverless/edge environments like Vercel — no connection pooling to manage).
export const db = drizzle(sql, { schema });
