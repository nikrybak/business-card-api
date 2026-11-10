import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import type { CardLoaders } from '~/card/data';

import { ExperienceDto } from './dto';
import { Loaders } from './graphql.context';

@Resolver(() => ExperienceDto)
export class ExperienceResolver {
  /** All jobs of one response share a single achievements query */
  @ResolveField(() => [String])
  async achievements(
    @Parent() { id }: ExperienceDto,
    @Loaders() { achievements }: CardLoaders,
  ): Promise<string[]> {
    return (await achievements.load(id)).map(({ text }) => text);
  }
}
