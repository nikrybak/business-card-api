import { SkillCategory, type Skill } from './card.reader';
import { selectSkills, toPeriod } from './card.rules';

const month = (iso: string) => new Date(`${iso}-01T00:00:00Z`);

const aSkill = (name: string, category: SkillCategory): Skill => ({
  id: 1,
  profileId: 1,
  name,
  category,
  sortOrder: 0,
});

describe('toPeriod', () => {
  it('counts a closed period in calendar months with both ends included', () => {
    expect(toPeriod(month('2023-06'), month('2024-05'))).toEqual({
      start: '2023-06',
      end: '2024-05',
      months: 12,
    });
  });

  it('counts an open period up to now and keeps the end empty', () => {
    expect(toPeriod(month('2025-07'), null, month('2025-12'))).toEqual({
      start: '2025-07',
      end: null,
      months: 6,
    });
  });

  it('treats a period inside one month as one month', () => {
    expect(toPeriod(month('2024-08'), month('2024-08')).months).toBe(1);
  });
});

describe('selectSkills', () => {
  const skills = Object.freeze([
    aSkill('NestJS', SkillCategory.BACKEND),
    aSkill('PostgreSQL', SkillCategory.DATA),
  ]);

  it('keeps only the requested category', () => {
    expect(selectSkills(skills, SkillCategory.DATA).map(({ name }) => name)).toEqual(['PostgreSQL']);
  });

  it('returns a copy of all skills without a category', () => {
    const selected = selectSkills(skills);

    expect(selected).toEqual(skills);
    expect(selected).not.toBe(skills);
  });
});
