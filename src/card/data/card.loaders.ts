import { Injectable } from '@nestjs/common';

import { CardReader } from '~/card/domain';
import { groupedLoader } from '~/common/graphql';

export type CardLoaders = ReturnType<CardLoadersFactory['create']>;

/** A fresh set per request, so batching and caching never leak between requests */
@Injectable()
export class CardLoadersFactory {
  constructor(private readonly reader: CardReader) {}

  create() {
    const { reader } = this;
    return {
      links: groupedLoader((ids) => reader.findLinks(ids), byProfile),
      skills: groupedLoader((ids) => reader.findSkills(ids), byProfile),
      experience: groupedLoader((ids) => reader.findExperience(ids), byProfile),
      projects: groupedLoader((ids) => reader.findProjects(ids), byProfile),
      achievements: groupedLoader((ids) => reader.findAchievements(ids), byExperience),
    } as const;
  }
}

const byProfile = ({ profileId }: { profileId: number }): number => profileId;
const byExperience = ({ experienceId }: { experienceId: number }): number => experienceId;
