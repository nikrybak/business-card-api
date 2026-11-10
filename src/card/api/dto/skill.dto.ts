import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { SkillCategory } from '~/prisma';

registerEnumType(SkillCategory, { name: 'SkillCategory' });

@ObjectType('Skill')
export class SkillDto {
  @Field() readonly name!: string;
  @Field(() => SkillCategory) readonly category!: SkillCategory;
}

@ArgsType()
export class SkillsArgs {
  @Field(() => SkillCategory, { nullable: true, description: 'Only skills of this category' })
  readonly category?: SkillCategory;
}
