import { ArgsType, Field } from '@nestjs/graphql';

import { SkillCategory } from '~/card/domain/card.reader';

@ArgsType()
export class SkillsArgs {
  @Field(() => SkillCategory, { nullable: true, description: 'Only skills of this category' })
  readonly category?: SkillCategory | null;
}
