import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

if (existsSync('.env')) {
  process.loadEnvFile();
}

export default defineConfig({
  migrations: { seed: 'tsx src/database/seed/seed.ts' },
  datasource: { url: process.env.DATABASE_URL },
});
