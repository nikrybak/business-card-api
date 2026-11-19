import { Logger, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '~/app/app.module';
import { cardConfig, CardReader } from '~/card';
import { PrismaService } from '~/database';
import { seed } from '~/database/seed';

const start = async (ownerSlug?: string): Promise<INestApplication<App>> => {
  const builder = Test.createTestingModule({ imports: [AppModule] });
  if (ownerSlug) {
    builder.overrideProvider(cardConfig.KEY).useValue({ ownerSlug });
  }
  const app = (await builder.compile()).createNestApplication<INestApplication<App>>();
  await app.init();
  return app;
};

const post = async (app: INestApplication<App>, query: string): Promise<object> =>
  (await request(app.getHttpServer()).post('/graphql').send({ query }).expect(200)).body as object;

describe('GraphQL card errors', () => {
  let app: INestApplication<App> | undefined;

  afterEach(() => app?.close());

  it('answers PROFILE_NOT_FOUND when the configured owner is not in the database', async () => {
    app = await start('nobody');

    expect(await post(app, '{ profile { name } }')).toMatchObject({
      data: null,
      errors: [{ message: 'Profile "nobody" is not found', extensions: { code: 'PROFILE_NOT_FOUND' } }],
    });
  });

  it('masks a failure inside a nested field and logs it', async () => {
    app = await start();
    await seed(app.get(PrismaService));
    const logged = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest
      .spyOn(app.get(CardReader), 'findProjects')
      .mockRejectedValue(new Error('connection refused at 10.0.0.5'));

    expect(await post(app, '{ profile { name projects { name } } }')).toMatchObject({
      data: null,
      errors: [{ message: 'Internal server error', extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
    });
    expect(logged).toHaveBeenCalledWith(expect.stringContaining('connection refused at 10.0.0.5'));
  });
});
