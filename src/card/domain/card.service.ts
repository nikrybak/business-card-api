import { Inject, Injectable } from '@nestjs/common';

import { cardConfig, type CardConfig } from '~/card/card.config';
import type { Profile, Skill, SkillCategory } from '~/prisma';

import { ProfileNotFoundError } from './card.errors';
import { CardReader } from './card.reader';

@Injectable()
export class CardService {
  constructor(
    private readonly reader: CardReader,
    @Inject(cardConfig.KEY) private readonly config: CardConfig,
  ) {}

  /** The card presents one person, chosen by configuration */
  async getOwner(): Promise<Profile> {
    const { ownerSlug } = this.config;
    const profile = await this.reader.findProfile(ownerSlug);
    if (!profile) {
      throw new ProfileNotFoundError(ownerSlug);
    }
    return profile;
  }

  /** Skills of one category, or all of them; the input list is left untouched */
  selectSkills(skills: readonly Skill[], category?: SkillCategory): Skill[] {
    return category ? skills.filter((skill) => skill.category === category) : [...skills];
  }
}
