import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Period', { description: 'Calendar months, both ends included' })
export class PeriodDto {
  @Field({ description: 'YYYY-MM' }) readonly start!: string;

  @Field(() => String, { nullable: true, description: 'YYYY-MM, empty while the job is current' })
  readonly end!: string | null;

  @Field(() => Int) readonly months!: number;
}

/** Achievements are resolved as a separate field, batched for all jobs of a response */
@ObjectType('Experience')
export class ExperienceDto {
  @Field(() => ID) readonly id!: number;
  @Field() readonly company!: string;
  @Field() readonly position!: string;
  @Field() readonly location!: string;
  @Field(() => [String]) readonly stack!: readonly string[];
  @Field(() => PeriodDto) readonly period!: PeriodDto;
}
