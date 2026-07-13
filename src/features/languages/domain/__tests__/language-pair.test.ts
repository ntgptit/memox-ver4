/**
 * Unit tests for the LanguagePair entity + use cases (WBS 3.1).
 */

import { ok, err, isOk, isErr, notFoundError } from '@/shared';
import {
  makeLanguagePair,
  addLanguagePair,
  type LanguagePair,
  type LanguagePairRepository,
} from '@/features/languages/domain';

describe('makeLanguagePair (WBS 3.1)', () => {
  it('constructs a valid, trimmed pair', () => {
    const r = makeLanguagePair({ id: 'lp1', learning: ' Spanish ', native: 'English', createdAt: 1 });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.learning).toBe('Spanish');
      expect(r.value.native).toBe('English');
    }
  });

  it('rejects empty languages', () => {
    expect(isErr(makeLanguagePair({ id: 'lp1', learning: '', native: 'English', createdAt: 1 }))).toBe(true);
  });

  it('rejects identical learning/native (case-insensitive)', () => {
    const r = makeLanguagePair({ id: 'lp1', learning: 'English', native: 'english', createdAt: 1 });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('validation');
  });
});

class FakeLangRepo implements LanguagePairRepository {
  pairs = new Map<string, LanguagePair>();
  subscribe() {
    return () => {};
  }
  async getById(id: string) {
    const p = this.pairs.get(id);
    return p ? ok(p) : err(notFoundError('LanguagePair'));
  }
  async list() {
    return ok([...this.pairs.values()]);
  }
  async save(p: LanguagePair) {
    this.pairs.set(p.id, p);
    return ok(p);
  }
  async remove(id: string) {
    this.pairs.delete(id);
    return ok(undefined);
  }
}

describe('addLanguagePair use case (WBS 3.1)', () => {
  const deps = { repo: new FakeLangRepo(), ids: () => 'lp1', clock: () => 42 };

  it('persists a valid pair with injected id + timestamp', async () => {
    const r = await addLanguagePair(deps).execute({ learning: 'Spanish', native: 'English' });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.id).toBe('lp1');
      expect(r.value.createdAt).toBe(42);
    }
    expect(deps.repo.pairs.size).toBe(1);
  });

  it('short-circuits validation without writing', async () => {
    const repo = new FakeLangRepo();
    const r = await addLanguagePair({ repo, ids: () => 'lp2', clock: () => 0 }).execute({
      learning: 'English',
      native: 'English',
    });
    expect(isErr(r)).toBe(true);
    expect(repo.pairs.size).toBe(0);
  });
});
