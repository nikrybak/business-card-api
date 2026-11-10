import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Link', { description: 'A professional profile or a contact' })
export class LinkDto {
  @Field() readonly label!: string;
  @Field() readonly url!: string;
}
