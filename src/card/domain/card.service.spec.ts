import { ProfileNotFoundError } from './card.errors';
import { type CardReader, type Profile } from './card.reader';
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
});
