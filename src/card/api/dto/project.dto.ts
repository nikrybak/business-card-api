import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Project')
export class ProjectDto {
  @Field() readonly name!: string;
  @Field() readonly description!: string;
  @Field({ description: 'The project page or its repository' }) readonly url!: string;
  @Field(() => [String]) readonly stack!: readonly string[];
}
