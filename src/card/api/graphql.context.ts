import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import type { CardLoaders } from '~/card/data';

export interface GraphqlContext {
  readonly loaders: CardLoaders;
}

/** Injects the DataLoaders of the current request into a resolver */
export const Loaders = createParamDecorator(
  (_: unknown, context: ExecutionContext): CardLoaders =>
    GqlExecutionContext.create(context).getContext<GraphqlContext>().loaders,
);
