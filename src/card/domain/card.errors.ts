import { DomainError } from '~/common/errors';

export class ProfileNotFoundError extends DomainError {
  readonly code = 'PROFILE_NOT_FOUND';

  constructor(slug: string) {
    super(`Profile "${slug}" is not found`);
  }
}
