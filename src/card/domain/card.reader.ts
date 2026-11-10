import type { Achievement, Experience, Link, Profile, Project, Skill } from '~/prisma';

/**
 * Port: what the card needs from storage. Lists are read by many parent ids at once,
 * so the API can batch nested data instead of querying per parent
 */
export abstract class CardReader {
  abstract findProfile(slug: string): Promise<Profile | null>;
  abstract findLinks(profileIds: readonly number[]): Promise<Link[]>;
  abstract findSkills(profileIds: readonly number[]): Promise<Skill[]>;
  abstract findExperience(profileIds: readonly number[]): Promise<Experience[]>;
  abstract findAchievements(experienceIds: readonly number[]): Promise<Achievement[]>;
  abstract findProjects(profileIds: readonly number[]): Promise<Project[]>;
}
