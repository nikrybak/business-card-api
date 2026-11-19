import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { SkillCategory } from '~/card/domain/card.reader';
import type { Period } from '~/card/domain/card.rules';

registerEnumType(SkillCategory, { name: 'SkillCategory' });

/** Links, skills, experience and projects are resolved as separate fields, only when selected */
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
export class PeriodOutput implements Period {
  @Field({ description: 'YYYY-MM' }) readonly start!: string;

  @Field(() => String, { nullable: true, description: 'YYYY-MM, empty while the job is current' })
  readonly end!: string | null;

  @Field(() => Int) readonly months!: number;
}

/** Achievements are resolved as a separate field, batched for all jobs of a response */
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
