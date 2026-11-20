import {
  type Achievement,
  type CardReader,
  type Experience,
  type Link,
  type Profile,
  type Project,
  type Skill,
} from '~/card/domain/card.reader';

type CardRows = {
  readonly profiles: readonly Profile[];
  readonly links: readonly Link[];
  readonly skills: readonly Skill[];
  readonly experience: readonly Experience[];
  readonly achievements: readonly Achievement[];
  readonly projects: readonly Project[];
};

const ofParents = <T>(rows: readonly T[], parentIdOf: (row: T) => number, ids: readonly number[]): T[] =>
  rows.filter((row) => ids.includes(parentIdOf(row)));

export class InMemoryCardReader implements CardReader {
  constructor(private readonly rows: CardRows) {}

  async findProfile(slug: string): Promise<Profile | null> {
    return this.rows.profiles.find((profile) => profile.slug === slug) ?? null;
  }

  async findLinks(profileIds: readonly number[]): Promise<Link[]> {
    return ofParents(this.rows.links, (row) => row.profileId, profileIds);
  }

  async findSkills(profileIds: readonly number[]): Promise<Skill[]> {
    return ofParents(this.rows.skills, (row) => row.profileId, profileIds);
  }

  async findExperience(profileIds: readonly number[]): Promise<Experience[]> {
    return ofParents(this.rows.experience, (row) => row.profileId, profileIds);
  }

  async findAchievements(experienceIds: readonly number[]): Promise<Achievement[]> {
    return ofParents(this.rows.achievements, (row) => row.experienceId, experienceIds);
  }

  async findProjects(profileIds: readonly number[]): Promise<Project[]> {
    return ofParents(this.rows.projects, (row) => row.profileId, profileIds);
  }
}
