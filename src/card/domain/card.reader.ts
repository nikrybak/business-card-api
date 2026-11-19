import type { Achievement, Experience, Link, Profile, Project, Skill } from '~/database';

export { SkillCategory } from '~/database';
export type { Achievement, Experience, Link, Profile, Project, Skill };

export abstract class CardReader {
  abstract findProfile(slug: string): Promise<Profile | null>;
  abstract findLinks(profileIds: readonly number[]): Promise<Link[]>;
  abstract findSkills(profileIds: readonly number[]): Promise<Skill[]>;
  abstract findExperience(profileIds: readonly number[]): Promise<Experience[]>;
  abstract findAchievements(experienceIds: readonly number[]): Promise<Achievement[]>;
  abstract findProjects(profileIds: readonly number[]): Promise<Project[]>;
}
