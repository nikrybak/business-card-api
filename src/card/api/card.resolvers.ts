import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { selectSkills } from '~/card/domain/card.rules';

import { SkillsArgs } from './card.inputs';
import { Loaders, type CardLoaders } from './card.loaders';
import {
  CardMapper,
  ExperienceOutput,
  LinkOutput,
  ProfileOutput,
  ProjectOutput,
  SkillOutput,
} from './card.outputs';

@Resolver(() => ProfileOutput)
export class ProfileResolver {
  @Query(() => ProfileOutput, { description: 'The owner of this business card' })
  async profile(@Loaders() { owner }: CardLoaders): Promise<ProfileOutput> {
    return CardMapper.profile(await owner());
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
  @ResolveField(() => [String])
  async achievements(
    @Parent() { id }: ExperienceOutput,
    @Loaders() { achievements }: CardLoaders,
  ): Promise<string[]> {
    return (await achievements.load(id)).map(({ text }) => text);
  }
}
