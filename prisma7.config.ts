// Prisma 7 config. This file's name (prisma7.config.ts) is Prisma's own
// versioned default for this major version -- see `npx prisma init`.
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Supabase gives one pooled connection string (port 6543, pgbouncer
// transaction mode) as SUPABASE_CONNECTION_KEY. We use it directly for both
// runtime queries and schema sync (`prisma db push`). A true session-mode
// direct connection (port 5432) would be preferable for migrations, but it
// is not reachable from this network, so this project standardizes on
// `db push` for schema sync instead of `prisma migrate`. See README.
const pooledUrl = process.env["SUPABASE_CONNECTION_KEY"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: pooledUrl,
  },
});
