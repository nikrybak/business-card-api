import { toPeriod } from '~/card/domain';
import type { Experience, Link, Profile, Project, Skill } from '~/prisma';

import type { ExperienceDto, LinkDto, ProfileDto, ProjectDto, SkillDto } from './dto';

/** Storage records to response DTOs: pure functions, nothing beyond the public contract leaks out */
export const CardMapper = {
  profile: ({ id, name, headline, description, location }: Profile): ProfileDto => ({
    id,
    name,
    headline,
    description,
    location,
  }),

  link: ({ label, url }: Link): LinkDto => ({ label, url }),

  skill: ({ name, category }: Skill): SkillDto => ({ name, category }),

  experience: ({
    id,
    company,
    position,
    location,
    stack,
    startedAt,
    endedAt,
  }: Experience): ExperienceDto => ({
    id,
    company,
    position,
    location,
    stack,
    period: toPeriod(startedAt, endedAt),
  }),

  project: ({ name, description, url, stack }: Project): ProjectDto => ({ name, description, url, stack }),
} as const;
