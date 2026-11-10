import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient, type SkillCategory } from '~/generated/prisma/client';

import { card } from './card.data';

const month = (value: string): Date => new Date(`${value}-01T00:00:00Z`);

/**
 * Idempotent: the card in code is the source of truth,
 * so the stored copy is replaced as a whole in one transaction
 */
export async function seed(prisma: PrismaClient): Promise<void> {
  const { links, skills, experience, projects, ...profile } = card;
  const skillRows = Object.entries(skills).flatMap(([category, names]) =>
    names.map((name) => ({ name, category: category as SkillCategory })),
  );

  await prisma.$transaction(async (tx) => {
    await tx.profile.deleteMany({ where: { slug: profile.slug } });
    await tx.profile.create({
      data: {
        ...profile,
        links: { create: links.map((link, sortOrder) => ({ ...link, sortOrder })) },
        skills: { create: skillRows.map((skill, sortOrder) => ({ ...skill, sortOrder })) },
        projects: { create: projects.map((project, sortOrder) => ({ ...project, sortOrder })) },
        experience: {
          create: experience.map(({ startedAt, endedAt, achievements, ...job }) => ({
            ...job,
            startedAt: month(startedAt),
            endedAt: endedAt === null ? null : month(endedAt),
            achievements: { create: achievements.map((text, sortOrder) => ({ text, sortOrder })) },
          })),
        },
      },
    });
  });
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
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
