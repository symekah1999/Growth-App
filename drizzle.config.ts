import { defineConfig } from "drizzle-kit";

// `generate` only reads the schema and doesn't need a real connection, but
// `push`/`studio`/`migrate` do — set DATABASE_URL in .env.local for those
// (see .env.example / README.md).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://placeholder",
  },
  strict: true,
  verbose: true,
});
