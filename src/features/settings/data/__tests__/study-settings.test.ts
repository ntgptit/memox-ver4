/**
 * Study-settings persistence (WBS 10.1) — defaults on missing/corrupt/invalid
 * JSON, save→load round-trip over an in-memory repository.
 */

import { ok } from '@/shared';
import type { SettingsRepository } from '../settings-repository';
import { DEFAULT_STUDY_SETTINGS, loadStudySettings, saveStudySettings } from '../study-settings';

function memoryRepo(): SettingsRepository {
  const store = new Map<string, string>();
  return {
    async get(key) {
      return ok(store.get(key) ?? null);
    },
    async set(key, value) {
      store.set(key, value);
      return ok(undefined);
    },
    subscribe() {
      return () => {};
    },
  };
}

describe('study-settings persistence', () => {
  it('missing key → the kit defaults', async () => {
    expect(await loadStudySettings(memoryRepo())).toEqual(DEFAULT_STUDY_SETTINGS);
  });

  it('corrupt JSON and invalid shapes → the defaults', async () => {
    const repo = memoryRepo();
    await repo.set('study', '{nope');
    expect(await loadStudySettings(repo)).toEqual(DEFAULT_STUDY_SETTINGS);
    await repo.set('study', JSON.stringify({ shuffle: 'yes' }));
    expect(await loadStudySettings(repo)).toEqual(DEFAULT_STUDY_SETTINGS);
  });

  it('save → load round-trips every field', async () => {
    const repo = memoryRepo();
    const edited = {
      ...DEFAULT_STUDY_SETTINGS,
      wordsPerRound: 20,
      shuffle: false,
      stt: true,
    };
    await saveStudySettings(repo, edited);
    expect(await loadStudySettings(repo)).toEqual(edited);
  });
});
