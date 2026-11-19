import { createParamDecorator, Injectable, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { CardReader } from '~/card/domain/card.reader';
import { groupedLoader } from '~/common/graphql';

export type CardLoaders = ReturnType<CardLoadersFactory['create']>;

export interface GraphqlContext {
  readonly loaders: CardLoaders;
}

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

/** Injects the DataLoaders of the current request into a resolver */
export const Loaders = createParamDecorator(
  (_: unknown, context: ExecutionContext): CardLoaders =>
    GqlExecutionContext.create(context).getContext<GraphqlContext>().loaders,
);

const byProfile = ({ profileId }: { profileId: number }): number => profileId;
const byExperience = ({ experienceId }: { experienceId: number }): number => experienceId;
