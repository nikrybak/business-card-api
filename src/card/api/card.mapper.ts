import type { Experience, Link, Profile, Project, Skill } from '~/card/domain/card.reader';
import { toPeriod } from '~/card/domain/card.rules';

import type { ExperienceOutput, LinkOutput, ProfileOutput, ProjectOutput, SkillOutput } from './card.outputs';

/** Storage records to response DTOs: pure functions, nothing beyond the public contract leaks out */
export const CardMapper = {
  profile: ({ id, name, headline, description, location }: Profile): ProfileOutput => ({
    id,
    name,
    headline,
    description,
    location,
  }),

  link: ({ label, url }: Link): LinkOutput => ({ label, url }),

  skill: ({ name, category }: Skill): SkillOutput => ({ name, category }),

  experience: ({
    id,
    company,
    position,
    location,
    stack,
    startedAt,
    endedAt,
  }: Experience): ExperienceOutput => ({
    id,
    company,
    position,
    location,
    stack,
    period: toPeriod(startedAt, endedAt),
  }),

  project: ({ name, description, url, stack }: Project): ProjectOutput => ({ name, description, url, stack }),
} as const;
