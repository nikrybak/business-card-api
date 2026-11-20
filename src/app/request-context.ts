import { randomUUID } from 'node:crypto';

import type { GraphqlContext } from '~/card';

export const REQUEST_ID_HEADER = 'x-request-id';

export type RequestContext = GraphqlContext & {
  readonly requestId: string;
};

export type HttpExchange = {
  readonly req: { header(name: string): string | undefined };
  readonly res: { setHeader(name: string, value: string): unknown };
};

const CLIENT_REQUEST_ID = /^[\w-]{1,64}$/;

export function requestIdOf(clientValue: string | undefined): string {
  return clientValue && CLIENT_REQUEST_ID.test(clientValue) ? clientValue : randomUUID();
}
