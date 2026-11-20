import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient, type SkillCategory } from '~/generated/prisma/client';
import { readEnv } from '~/shared/env';

import { card } from './card.data';

const month = (value: string): Date => new Date(`${value}-01T00:00:00Z`);
const ordered = <T extends object>(rows: readonly T[]) =>
  rows.map((row, sortOrder) => ({ ...row, sortOrder }));
const replace = <T>(data: T[]) => ({ deleteMany: {}, createMany: { data } });

export async function seed(prisma: PrismaClient): Promise<void> {
  const { links, skills, experience, projects, ...profile } = card;
  const lists = {
    links: ordered(links),
    skills: ordered(
      Object.entries(skills).flatMap(([category, names]) =>
        names.map((name) => ({ name, category: category as SkillCategory })),
      ),
    ),
    projects: ordered(projects),
  };
  const jobs = experience.map(({ startedAt, endedAt, achievements, ...job }) => ({
    ...job,
    startedAt: month(startedAt),
    endedAt: endedAt === null ? null : month(endedAt),
    achievements: ordered(achievements.map((text) => ({ text }))),
  }));

  await prisma.$transaction(
    async (tx) => {
      const { id: profileId } = await tx.profile.upsert({
        where: { slug: profile.slug },
        create: {
          ...profile,
          links: { createMany: { data: lists.links } },
          skills: { createMany: { data: lists.skills } },
          projects: { createMany: { data: lists.projects } },
        },
        update: {
          ...profile,
          links: replace(lists.links),
          skills: replace(lists.skills),
          projects: replace(lists.projects),
        },
      });

      await tx.experience.deleteMany({
        where: { profileId, NOT: { OR: jobs.map(({ startedAt, company }) => ({ startedAt, company })) } },
      });
      for (const { achievements, ...job } of jobs) {
        await tx.experience.upsert({
          where: {
            profileId_startedAt_company: { profileId, startedAt: job.startedAt, company: job.company },
          },
          create: { ...job, profileId, achievements: { createMany: { data: achievements } } },
          update: { ...job, achievements: replace(achievements) },
        });
      }
    },
    { maxWait: 10_000, timeout: 30_000 },
  );
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: readEnv('DATABASE_URL'), connectionTimeoutMillis: 5_000 }),
  });
  try {
    await seed(prisma);
    console.log(`Seeded profile "${card.slug}"`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
