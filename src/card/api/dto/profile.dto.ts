import { Field, ID, ObjectType } from '@nestjs/graphql';

/** Links, skills, experience and projects are resolved as separate fields, only when selected */
@ObjectType('Profile', { description: 'The person behind the card' })
export class ProfileDto {
  @Field(() => ID) readonly id!: number;
  @Field() readonly name!: string;
  @Field() readonly headline!: string;
  @Field() readonly description!: string;
  @Field() readonly location!: string;
}
