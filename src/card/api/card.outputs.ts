import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  SkillCategory,
  type Experience,
  type Link,
  type Profile,
  type Project,
  type Skill,
} from '~/card/domain/card.reader';
import { toPeriod, type Period } from '~/card/domain/card.rules';

registerEnumType(SkillCategory, { name: 'SkillCategory' });

@ObjectType('Profile', { description: 'The person behind the card' })
export class ProfileOutput {
  @Field(() => ID) readonly id!: number;
  @Field() readonly name!: string;
  @Field() readonly headline!: string;
  @Field() readonly description!: string;
  @Field() readonly location!: string;
}

@ObjectType('Link', { description: 'A professional profile or a contact' })
export class LinkOutput {
  @Field() readonly label!: string;
  @Field() readonly url!: string;
}

@ObjectType('Skill')
export class SkillOutput {
  @Field() readonly name!: string;
  @Field(() => SkillCategory) readonly category!: SkillCategory;
}

@ObjectType('Period', { description: 'Calendar months, both ends included' })
class PeriodOutput implements Period {
  @Field({ description: 'YYYY-MM' }) readonly start!: string;

  @Field(() => String, { nullable: true, description: 'YYYY-MM, null while the job is current' })
  readonly end!: string | null;

  @Field(() => Int) readonly months!: number;
}

@ObjectType('Experience')
export class ExperienceOutput {
  @Field(() => ID) readonly id!: number;
  @Field() readonly company!: string;
  @Field() readonly position!: string;
  @Field() readonly location!: string;
  @Field(() => [String]) readonly stack!: readonly string[];
  @Field(() => PeriodOutput) readonly period!: PeriodOutput;
}

@ObjectType('Project')
export class ProjectOutput {
  @Field() readonly name!: string;
  @Field() readonly description!: string;
  @Field({ description: 'The project page or its repository' }) readonly url!: string;
  @Field(() => [String]) readonly stack!: readonly string[];
}

export const CardMapper = {
  profile: ({ id, name, headline, description, location }: Profile): ProfileOutput => ({
    id,
    name,
    headline,
    description,
    location,
  }),

  link: ({ label, url }: Link): LinkOutput => ({ label, url }),

  skill: ({ name, category }: Skill): SkillOutput => ({ name, category }),

  experience: ({
    id,
    company,
    position,
    location,
    stack,
    startedAt,
    endedAt,
  }: Experience): ExperienceOutput => ({
    id,
    company,
    position,
    location,
    stack,
    period: toPeriod(startedAt, endedAt),
  }),

  project: ({ name, description, url, stack }: Project): ProjectOutput => ({ name, description, url, stack }),
} as const;
