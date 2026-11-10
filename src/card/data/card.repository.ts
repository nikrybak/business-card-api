import { Injectable } from '@nestjs/common';

import { CardReader } from '~/card/domain';
import {
  PrismaService,
  type Achievement,
  type Experience,
  type Link,
  type Profile,
  type Project,
  type Skill,
} from '~/prisma';

/** Prisma adapter of the CardReader port */
@Injectable()
export class PrismaCardRepository implements CardReader {
  constructor(private readonly prisma: PrismaService) {}

  findProfile(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { slug } });
  }

  findLinks(profileIds: readonly number[]): Promise<Link[]> {
    return this.prisma.link.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findSkills(profileIds: readonly number[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findExperience(profileIds: readonly number[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { startedAt: 'desc' },
    });
  }

  findAchievements(experienceIds: readonly number[]): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findProjects(profileIds: readonly number[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
