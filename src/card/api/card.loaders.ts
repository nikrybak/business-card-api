import { Injectable } from '@nestjs/common';
import { Context } from '@nestjs/graphql';

import { CardReader, type Profile } from '~/card/domain/card.reader';
import { CardService } from '~/card/domain/card.service';
import { groupedLoader } from '~/shared/grouped-loader';

export type CardLoaders = ReturnType<CardLoadersFactory['create']>;

export type GraphqlContext = {
  readonly loaders: CardLoaders;
};

export const Loaders = (): ParameterDecorator => Context('loaders' satisfies keyof GraphqlContext);

@Injectable()
export class CardLoadersFactory {
  constructor(
    private readonly reader: CardReader,
    private readonly card: CardService,
  ) {}

  create() {
    const { reader, card } = this;
    let owner: Promise<Profile> | undefined;
    return {
      owner: () => (owner ??= card.getOwner()),
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
