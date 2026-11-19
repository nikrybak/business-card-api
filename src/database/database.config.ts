import { registerAs, type ConfigType } from '@nestjs/config';

import { readEnv } from '~/shared/env';

export const databaseConfig = registerAs('database', () => ({
  url: readEnv('DATABASE_URL'),
}));

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
