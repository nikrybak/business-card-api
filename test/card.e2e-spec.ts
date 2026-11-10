import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '~/app.module';
import { CardReader } from '~/card/domain';
import { PrismaService } from '~/prisma';
import { seed } from '~/prisma/seed';

interface Job {
  company: string;
  period: { start: string; end: string | null; months: number };
  achievements: string[];
}

interface Card {
  profile: {
    name: string;
    links: { label: string; url: string }[];
    skills: { name: string; category: string }[];
    experience: Job[];
    projects: { name: string; url: string }[];
  };
}

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
  afterEach(() => jest.restoreAllMocks());

  const query = async <T>(text: string): Promise<T> => {
    const response = await request(app.getHttpServer()).post('/graphql').send({ query: text }).expect(200);
    return (response.body as { data: T }).data;
  };

  it('returns the seeded profile with its nested data', async () => {
    const { profile } = await query<Card>(FULL_CARD);

    expect(profile.name).toBe('Nikita Rybak');
    expect(profile.links).toContainEqual({ label: 'GitHub', url: 'https://github.com/nikrybak' });
    expect(profile.skills).toContainEqual({ name: 'NestJS', category: 'BACKEND' });
    expect(profile.experience[0]).toMatchObject({ company: 'Bambit', period: { end: null } });
    expect(profile.experience.every(({ achievements }) => achievements.length > 0)).toBe(true);
    expect(profile.projects.length).toBeGreaterThan(0);
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
    const projects = jest.spyOn(reader, 'findProjects');

    await query<Card>('{ profile { name } }');

    expect(projects).not.toHaveBeenCalled();
  });

  it('answers a database check on /health', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
  });
});
