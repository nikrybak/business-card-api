import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';

/** One line per operation: name, duration and whether it failed */
@Plugin()
export class RequestLoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger('GraphQL');

  async requestDidStart(): Promise<GraphQLRequestListener<object>> {
    const startedAt = performance.now();

    return {
      willSendResponse: async ({ operationName, errors }) => {
        const duration = Math.round(performance.now() - startedAt);
        const outcome = errors?.length ? `failed: ${errors.map(({ message }) => message).join('; ')}` : 'ok';
        this.logger.log(`${operationName ?? 'anonymous'} ${duration} ms ${outcome}`);
      },
    };
  }
}
