import type { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';

import type { RequestContext } from './request-context';

@Plugin()
export class RequestLoggingPlugin implements ApolloServerPlugin<RequestContext> {
  private readonly logger = new Logger('GraphQL');

  async requestDidStart({
    contextValue,
  }: GraphQLRequestContext<RequestContext>): Promise<GraphQLRequestListener<RequestContext>> {
    const startedAt = performance.now();

    return {
      willSendResponse: async ({ operationName, errors }) => {
        this.logger.log({
          requestId: contextValue.requestId,
          operation: operationName ?? null,
          durationMs: Math.round(performance.now() - startedAt),
          errors: errors?.map(({ message }) => message) ?? [],
        });
      },
    };
  }
}
