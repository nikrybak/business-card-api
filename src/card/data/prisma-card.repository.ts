import { Injectable } from '@nestjs/common';

import {
  CardReader,
  type Achievement,
  type Experience,
  type Link,
  type Profile,
  type Project,
  type Skill,
} from '~/card/domain/card.reader';
import { PrismaService } from '~/database';

const ofProfiles = (profileIds: readonly number[]) => ({ profileId: { in: [...profileIds] } });
const ofJobs = (experienceIds: readonly number[]) => ({ experienceId: { in: [...experienceIds] } });
const IN_CARD_ORDER = { sortOrder: 'asc' } as const;
const NEWEST_FIRST = { startedAt: 'desc' } as const;

@Injectable()
export class PrismaCardRepository implements CardReader {
  constructor(private readonly prisma: PrismaService) {}

  findProfile(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { slug } });
  }

  findLinks(profileIds: readonly number[]): Promise<Link[]> {
    return this.prisma.link.findMany({ where: ofProfiles(profileIds), orderBy: IN_CARD_ORDER });
  }

  findSkills(profileIds: readonly number[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({ where: ofProfiles(profileIds), orderBy: IN_CARD_ORDER });
  }

  findExperience(profileIds: readonly number[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({ where: ofProfiles(profileIds), orderBy: NEWEST_FIRST });
  }

  findAchievements(experienceIds: readonly number[]): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({ where: ofJobs(experienceIds), orderBy: IN_CARD_ORDER });
  }

  findProjects(profileIds: readonly number[]): Promise<Project[]> {
    return this.prisma.project.findMany({ where: ofProfiles(profileIds), orderBy: IN_CARD_ORDER });
  }
}
