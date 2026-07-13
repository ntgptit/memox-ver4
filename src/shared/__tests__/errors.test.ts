/**
 * Unit tests for the app error model + user-facing mapping (WBS 0.6).
 * Covers the DoD "unit tests for mapping": every AppError kind maps to a
 * UserFacingError, and `retryable` matches the recoverable-error contract.
 */

import {
  validationError,
  notFoundError,
  conflictError,
  storageError,
  unexpectedError,
  toUserFacingError,
  type AppError,
} from '@/shared/errors';

describe('error constructors (WBS 0.6)', () => {
  it('validationError carries per-field issues', () => {
    const e = validationError([{ field: 'term', message: 'Required' }]);
    expect(e.kind).toBe('validation');
    expect(e.issues).toHaveLength(1);
    expect(e.issues[0].field).toBe('term');
  });

  it('notFoundError defaults its message from the entity', () => {
    expect(notFoundError('Deck').message).toBe('Deck not found.');
  });
});

describe('toUserFacingError mapping (WBS 0.6)', () => {
  it('maps storage failures as retryable', () => {
    const uf = toUserFacingError(storageError('Could not save your changes.'));
    expect(uf.retryable).toBe(true);
    expect(uf.title).toBe('Save failed');
    expect(uf.message).toBe('Could not save your changes.');
  });

  it('maps unexpected failures as retryable (best effort)', () => {
    expect(toUserFacingError(unexpectedError()).retryable).toBe(true);
  });

  it('maps validation / not-found / conflict as NOT retryable', () => {
    expect(toUserFacingError(validationError([])).retryable).toBe(false);
    expect(toUserFacingError(notFoundError('Card')).retryable).toBe(false);
    expect(toUserFacingError(conflictError('Deck already exists.')).retryable).toBe(false);
  });

  it('produces a non-empty title + message for every AppError kind (total mapping)', () => {
    const samples: AppError[] = [
      validationError([]),
      notFoundError('Deck'),
      conflictError('dup'),
      storageError(),
      unexpectedError(),
    ];
    for (const e of samples) {
      const uf = toUserFacingError(e);
      expect(uf.title.length).toBeGreaterThan(0);
      expect(uf.message.length).toBeGreaterThan(0);
      expect(typeof uf.retryable).toBe('boolean');
    }
  });
});
