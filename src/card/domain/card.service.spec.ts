import { SkillCategory, type Profile, type Skill } from '~/prisma';

import { ProfileNotFoundError } from './card.errors';
import { type CardReader } from './card.reader';
import { CardService } from './card.service';

const aProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 1,
  slug: 'nikita-rybak',
  name: 'Nikita Rybak',
  headline: 'Full-stack developer',
  description: 'Builds products end to end',
  location: 'Remote',
  ...overrides,
});

const aSkill = (name: string, category: SkillCategory): Skill => ({
  id: 1,
  profileId: 1,
  name,
  category,
  sortOrder: 0,
});

describe('CardService', () => {
  const findProfile = jest.fn<Promise<Profile | null>, [string]>();
  const reader = { findProfile } as unknown as CardReader;
  const service = new CardService(reader, { ownerSlug: 'nikita-rybak' });

  beforeEach(() => findProfile.mockReset());

  describe('getOwner', () => {
    it('returns the configured owner', async () => {
      findProfile.mockResolvedValue(aProfile());

      await expect(service.getOwner()).resolves.toMatchObject({ name: 'Nikita Rybak' });
      expect(findProfile).toHaveBeenCalledWith('nikita-rybak');
    });

    it('fails with a domain error when the owner is not seeded', async () => {
      findProfile.mockResolvedValue(null);

      await expect(service.getOwner()).rejects.toBeInstanceOf(ProfileNotFoundError);
    });
  });

  describe('selectSkills', () => {
    const skills = Object.freeze([
      aSkill('NestJS', SkillCategory.BACKEND),
      aSkill('PostgreSQL', SkillCategory.DATA),
    ]);

    it('keeps only the requested category', () => {
      expect(service.selectSkills(skills, SkillCategory.DATA).map(({ name }) => name)).toEqual([
        'PostgreSQL',
      ]);
    });

    it('returns a copy of all skills without a category', () => {
      const selected = service.selectSkills(skills);

      expect(selected).toEqual(skills);
      expect(selected).not.toBe(skills);
    });
  });
});
