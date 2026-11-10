import 'dotenv/config';

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/prisma/seed/seed.ts',
  },
  datasource: {
    // Read lazily: `prisma generate` runs at build time without a database.
    url: process.env.DATABASE_URL,
  },
});
