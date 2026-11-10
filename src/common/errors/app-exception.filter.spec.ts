import { Logger, type ArgumentsHost } from '@nestjs/common';
import { GraphQLError } from 'graphql';

import { AppExceptionFilter } from './app-exception.filter';
import { DomainError } from './domain.error';

class OutOfStockError extends DomainError {
  readonly code = 'OUT_OF_STOCK';
}

const graphqlHost = { getType: () => 'graphql' } as unknown as ArgumentsHost;

describe('AppExceptionFilter', () => {
  const filter = new AppExceptionFilter();

  it('passes a domain error to the client with its code', () => {
    const error = filter.catch(new OutOfStockError('No items left'), graphqlHost);

    expect(error).toBeInstanceOf(GraphQLError);
    expect(error).toMatchObject({ message: 'No items left', extensions: { code: 'OUT_OF_STOCK' } });
  });

  it('keeps a GraphQL error as it is', () => {
    const original = new GraphQLError('Bad query', { extensions: { code: 'BAD_USER_INPUT' } });

    expect(filter.catch(original, graphqlHost)).toBe(original);
  });

  it('logs an unexpected error and hides its details', () => {
    const log = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const error = filter.catch(new Error('connection refused at 10.0.0.5'), graphqlHost);

    expect(error).toMatchObject({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('connection refused'));
  });
});
