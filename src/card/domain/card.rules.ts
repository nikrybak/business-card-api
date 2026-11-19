import type { Skill, SkillCategory } from './card.reader';

export interface Period {
  readonly start: string;
  readonly end: string | null;
  readonly months: number;
}

const toMonth = (date: Date): string => date.toISOString().slice(0, 7);

/** An employment period in whole calendar months, both ends included; no end means "until now" */
export function toPeriod(startedAt: Date, endedAt: Date | null, now = new Date()): Period {
  const until = endedAt ?? now;
  const months =
    (until.getUTCFullYear() - startedAt.getUTCFullYear()) * 12 +
    (until.getUTCMonth() - startedAt.getUTCMonth()) +
    1;

  return { start: toMonth(startedAt), end: endedAt && toMonth(endedAt), months };
}

/** Skills of one category, or all of them; the input list is left untouched */
export function selectSkills(skills: readonly Skill[], category?: SkillCategory): Skill[] {
  return category ? skills.filter((skill) => skill.category === category) : [...skills];
}
