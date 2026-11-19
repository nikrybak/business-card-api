import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { selectSkills } from '~/card/domain/card.rules';
import { CardService } from '~/card/domain/card.service';

import { SkillsArgs } from './card.inputs';
import { Loaders, type CardLoaders } from './card.loaders';
import { CardMapper } from './card.mapper';
import { ExperienceOutput, LinkOutput, ProfileOutput, ProjectOutput, SkillOutput } from './card.outputs';

@Resolver(() => ProfileOutput)
export class ProfileResolver {
  constructor(private readonly card: CardService) {}

  @Query(() => ProfileOutput, { description: 'The owner of this business card' })
  async profile(): Promise<ProfileOutput> {
    return CardMapper.profile(await this.card.getOwner());
  }

  @ResolveField(() => [LinkOutput])
  async links(@Parent() { id }: ProfileOutput, @Loaders() { links }: CardLoaders): Promise<LinkOutput[]> {
    return (await links.load(id)).map(CardMapper.link);
  }

  @ResolveField(() => [SkillOutput])
  async skills(
    @Parent() { id }: ProfileOutput,
    @Args() { category }: SkillsArgs,
    @Loaders() { skills }: CardLoaders,
  ): Promise<SkillOutput[]> {
    return selectSkills(await skills.load(id), category).map(CardMapper.skill);
  }

  @ResolveField(() => [ExperienceOutput])
  async experience(
    @Parent() { id }: ProfileOutput,
    @Loaders() { experience }: CardLoaders,
  ): Promise<ExperienceOutput[]> {
    return (await experience.load(id)).map(CardMapper.experience);
  }

  @ResolveField(() => [ProjectOutput])
  async projects(
    @Parent() { id }: ProfileOutput,
    @Loaders() { projects }: CardLoaders,
  ): Promise<ProjectOutput[]> {
    return (await projects.load(id)).map(CardMapper.project);
  }
}

@Resolver(() => ExperienceOutput)
export class ExperienceResolver {
  /** All jobs of one response share a single achievements query */
  @ResolveField(() => [String])
  async achievements(
    @Parent() { id }: ExperienceOutput,
    @Loaders() { achievements }: CardLoaders,
  ): Promise<string[]> {
    return (await achievements.load(id)).map(({ text }) => text);
  }
}
