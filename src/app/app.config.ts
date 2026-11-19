import { registerAs, type ConfigType } from '@nestjs/config';

import { readEnv, readPort } from '~/shared/env';

export const appConfig = registerAs('app', () => ({
  port: readPort('PORT', 3000),
  isProduction: readEnv('NODE_ENV', 'development') === 'production',
}));

export type AppConfig = ConfigType<typeof appConfig>;
