import { registerAs, type ConfigType } from '@nestjs/config';

import { readEnv } from '~/config';

export const cardConfig = registerAs('card', () => ({
  ownerSlug: readEnv('PROFILE_SLUG', 'nikita-rybak'),
}));

export type CardConfig = ConfigType<typeof cardConfig>;
