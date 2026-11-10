import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import type { CardLoaders } from '~/card/data';
import { CardService } from '~/card/domain';

import { CardMapper } from './card.mapper';
import { ExperienceDto, LinkDto, ProfileDto, ProjectDto, SkillDto, SkillsArgs } from './dto';
import { Loaders } from './graphql.context';

@Resolver(() => ProfileDto)
export class ProfileResolver {
  constructor(private readonly card: CardService) {}

  @Query(() => ProfileDto, { description: 'The owner of this business card' })
  async profile(): Promise<ProfileDto> {
    return CardMapper.profile(await this.card.getOwner());
  }

  @ResolveField(() => [LinkDto])
  async links(@Parent() { id }: ProfileDto, @Loaders() { links }: CardLoaders): Promise<LinkDto[]> {
    return (await links.load(id)).map(CardMapper.link);
  }

  @ResolveField(() => [SkillDto])
  async skills(
    @Parent() { id }: ProfileDto,
    @Args() { category }: SkillsArgs,
    @Loaders() { skills }: CardLoaders,
  ): Promise<SkillDto[]> {
    return this.card.selectSkills(await skills.load(id), category).map(CardMapper.skill);
  }

  @ResolveField(() => [ExperienceDto])
  async experience(
    @Parent() { id }: ProfileDto,
    @Loaders() { experience }: CardLoaders,
  ): Promise<ExperienceDto[]> {
    return (await experience.load(id)).map(CardMapper.experience);
  }

  @ResolveField(() => [ProjectDto])
  async projects(@Parent() { id }: ProfileDto, @Loaders() { projects }: CardLoaders): Promise<ProjectDto[]> {
    return (await projects.load(id)).map(CardMapper.project);
  }
}
