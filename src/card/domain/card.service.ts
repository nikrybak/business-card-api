import { Inject, Injectable } from '@nestjs/common';

import { cardConfig, type CardConfig } from '~/card/card.config';

import { ProfileNotFoundError } from './card.errors';
import { CardReader, type Profile } from './card.reader';

@Injectable()
export class CardService {
  constructor(
    private readonly reader: CardReader,
    @Inject(cardConfig.KEY) private readonly config: CardConfig,
  ) {}

  async getOwner(): Promise<Profile> {
    const { ownerSlug } = this.config;
    const profile = await this.reader.findProfile(ownerSlug);
    if (!profile) {
      throw new ProfileNotFoundError(ownerSlug);
    }
    return profile;
  }
}
