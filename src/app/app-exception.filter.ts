import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { DomainError } from '~/shared/domain.error';

@Catch()
export class AppExceptionFilter extends BaseExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  override catch(error: unknown, host: ArgumentsHost): GraphQLError | undefined {
    if (host.getType<GqlContextType>() === 'graphql') {
      return this.toGraphqlError(error);
    }
    super.catch(error, host);
    return undefined;
  }

  private toGraphqlError(error: unknown): GraphQLError {
    if (error instanceof DomainError) {
      return new GraphQLError(error.message, { extensions: { code: error.code } });
    }
    if (error instanceof GraphQLError) {
      return error;
    }
    this.logger.error(error instanceof Error ? error.stack : String(error));
    return new GraphQLError('Internal server error', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
}
