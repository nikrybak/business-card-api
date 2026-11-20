import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getIntrospectionQuery } from 'graphql';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '~/app/app.module';
import { CardReader } from '~/card';
import { PrismaService } from '~/database';
import { card, seed } from '~/database/seed';

type Job = {
  company: string;
  period: { start: string; end: string | null; months: number };
  achievements: string[];
};

type Card = {
  profile: {
    name: string;
    links: { label: string; url: string }[];
    skills: { name: string; category: string }[];
    experience: Job[];
    projects: { name: string; url: string }[];
  };
};

const FULL_CARD = `{
  profile {
    name
    links { label url }
    skills { name category }
    experience { company period { start end months } achievements }
    projects { name url }
  }
}`;

describe('GraphQL business card', () => {
  let app: INestApplication<App>;
  let reader: CardReader;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    await seed(app.get(PrismaService));
    reader = app.get(CardReader);
  });

  afterAll(() => app.close());

  const query = async <T>(text: string): Promise<T> => {
    const response = await request(app.getHttpServer()).post('/graphql').send({ query: text }).expect(200);
    return (response.body as { data: T }).data;
  };

  it('returns the seeded profile with its nested data', async () => {
    const { profile } = await query<Card>(FULL_CARD);

    expect(profile.name).toBe(card.name);
    expect(profile.links).toEqual(card.links);
    expect(profile.skills).toEqual(
      Object.entries(card.skills).flatMap(([category, names]) => names.map((name) => ({ name, category }))),
    );
    expect(profile.experience.map(({ company, achievements }) => ({ company, achievements }))).toEqual(
      card.experience.map(({ company, achievements }) => ({ company, achievements })),
    );
    expect(profile.experience[0]?.period.end).toBeNull();
    expect(profile.projects).toEqual(card.projects.map(({ name, url }) => ({ name, url })));
  });

  it('filters skills by category', async () => {
    const { profile } = await query<Card>('{ profile { skills(category: MESSAGING) { name category } } }');

    expect(profile.skills).toEqual([
      { name: 'Kafka', category: 'MESSAGING' },
      { name: 'RabbitMQ', category: 'MESSAGING' },
    ]);
  });

  it('reads achievements of all jobs with one query instead of one per job', async () => {
    const achievements = jest.spyOn(reader, 'findAchievements');

    const { profile } = await query<Card>(FULL_CARD);

    expect(achievements).toHaveBeenCalledTimes(1);
    expect(achievements.mock.calls[0]?.[0]).toHaveLength(profile.experience.length);
  });

  it('does not touch tables the query does not select', async () => {
    const lists = (
      ['findLinks', 'findSkills', 'findExperience', 'findAchievements', 'findProjects'] as const
    ).map((name) => jest.spyOn(reader, name));

    await query<Card>('{ profile { name } }');

    for (const list of lists) expect(list).not.toHaveBeenCalled();
  });

  it('reads the owner once however many times the query repeats it', async () => {
    const owner = jest.spyOn(reader, 'findProfile');
    const aliases = Array.from({ length: 50 }, (_, index) => `a${index}: profile { name }`).join(' ');

    await query(`{ ${aliases} }`);

    expect(owner).toHaveBeenCalledTimes(1);
  });

  it('keeps ids and content when the seed runs again', async () => {
    const IDS = '{ profile { id experience { id company } } }';
    const before = await query<{ profile: { id: string; experience: { id: string }[] } }>(IDS);
    const card = await query<Card>(FULL_CARD);

    await seed(app.get(PrismaService));

    expect(await query(IDS)).toEqual(before);
    expect(await query<Card>(FULL_CARD)).toEqual(card);
  });

  it('refuses an oversized query before running it and still serves introspection', async () => {
    const profile = jest.spyOn(reader, 'findProfile');
    const aliases = Array.from({ length: 100 }, (_, index) => `a${index}: profile { name }`).join(' ');
    const introspection = getIntrospectionQuery({
      descriptions: true,
      inputValueDeprecation: true,
      oneOf: true,
    });

    const longString = `{ profile(id: "${'x'.repeat(20_000)}") { name } }`;

    for (const oversized of [`{ ${aliases} }`, longString]) {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: oversized })
        .expect(400);
      expect(response.body).toMatchObject({ errors: [{ extensions: { code: 'GRAPHQL_PARSE_FAILED' } }] });
      expect(JSON.stringify(response.body).length).toBeLessThan(1_000);
    }
    expect(profile).not.toHaveBeenCalled();
    await request(app.getHttpServer()).post('/graphql').send({ query: introspection }).expect(200);
  });

  it('is ready once the database answers', async () => {
    await request(app.getHttpServer()).get('/health/ready').expect(200, { status: 'ok' });
  });
});
