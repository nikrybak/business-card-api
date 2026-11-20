import { Logger, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '~/app/app.module';
import { CardReader, SkillCategory } from '~/card/domain/card.reader';
import { databaseConfig } from '~/database/database.config';

import { InMemoryCardReader } from './support/in-memory-card.reader';

const reader = new InMemoryCardReader({
  profiles: [
    {
      id: 7,
      slug: 'nikita-rybak',
      name: 'Ada Lovelace',
      headline: 'Analyst',
      description: 'Notes on the engine',
      location: 'London',
    },
  ],
  links: [{ id: 1, profileId: 7, label: 'Site', url: 'https://example.com', sortOrder: 0 }],
  skills: [
    { id: 1, profileId: 7, name: 'Math', category: SkillCategory.PRACTICE, sortOrder: 0 },
    { id: 2, profileId: 7, name: 'Algorithms', category: SkillCategory.BACKEND, sortOrder: 1 },
  ],
  experience: [
    {
      id: 3,
      profileId: 7,
      company: 'Analytical Engine',
      position: 'Programmer',
      location: 'London',
      startedAt: new Date('1842-10-01T00:00:00Z'),
      endedAt: new Date('1843-09-01T00:00:00Z'),
      stack: ['Punch cards'],
    },
  ],
  achievements: [{ id: 1, experienceId: 3, text: 'Wrote the first program', sortOrder: 0 }],
  projects: [],
});

describe('GraphQL card over an in-memory storage adapter', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CardReader)
      .useValue(reader)
      .overrideProvider(databaseConfig.KEY)
      .useValue({ url: 'postgresql://nobody@127.0.0.1:1/none' })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  const post = (query: string, requestId?: string) => {
    const call = request(app.getHttpServer()).post('/graphql');
    return (requestId ? call.set('x-request-id', requestId) : call).send({ query }).expect(200);
  };

  it('serves the card from whatever adapter implements the port, with no database behind it', async () => {
    const response = await post(`{
      profile {
        name
        links { label url }
        skills(category: PRACTICE) { name }
        experience { company period { start end months } achievements }
        projects { name }
      }
    }`);

    expect(response.body).toEqual({
      data: {
        profile: {
          name: 'Ada Lovelace',
          links: [{ label: 'Site', url: 'https://example.com' }],
          skills: [{ name: 'Math' }],
          experience: [
            {
              company: 'Analytical Engine',
              period: { start: '1842-10', end: '1843-09', months: 12 },
              achievements: ['Wrote the first program'],
            },
          ],
          projects: [],
        },
      },
    });
  });

  it('stays alive but answers 503 on readiness while the database is unreachable, without logging a failure', async () => {
    const logged = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(503, { message: 'Database is unreachable', statusCode: 503 });
    expect(logged).not.toHaveBeenCalled();
  });

  it('answers with a request id and logs the operation under it', async () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    const echoed = await post('query Name { profile { name } }', 'trace-42');
    const replaced = await post('{ profile { name } }', 'bad id; drop');

    expect(echoed.headers['x-request-id']).toBe('trace-42');
    expect(replaced.headers['x-request-id']).toMatch(/^[\da-f-]{36}$/);
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'trace-42', operation: 'Name', errors: [] }),
    );
  });
});
