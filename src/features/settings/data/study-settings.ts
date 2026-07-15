/**
 * Study-settings persistence (WBS 10.1) — the typed study config over the
 * app_setting key/value repository (0.5 storage strategy): survives restarts,
 * shape-validated (bad/missing JSON → the default). Consumed by the settings
 * screens and by study behavior (the session shell applies `shuffle`).
 */

import { isErr } from '@/shared';
import type { SettingsRepository } from './settings-repository';

export interface StudySettings {
  /** Word display. */
  colorByGender: boolean;
  showRomanization: boolean;
  /** Spaced repetition. */
  leitnerBoxes: number;
  dueNotifications: boolean;
  /** Mode settings. */
  wordsPerRound: number;
  shuffle: boolean;
  autoplayAudio: boolean;
  /** Voice. */
  tts: boolean;
  stt: boolean;
}

/** Kit defaults (Settings.jsx initial state + row values). */
export const DEFAULT_STUDY_SETTINGS: StudySettings = {
  colorByGender: true,
  showRomanization: false,
  leitnerBoxes: 8,
  dueNotifications: true,
  wordsPerRound: 5,
  shuffle: true,
  autoplayAudio: false,
  tts: true,
  stt: false,
};

const KEY = 'study';

const BOOL_KEYS = [
  'colorByGender',
  'showRomanization',
  'dueNotifications',
  'shuffle',
  'autoplayAudio',
  'tts',
  'stt',
] as const;
const NUMBER_KEYS = ['leitnerBoxes', 'wordsPerRound'] as const;

function isStudySettings(value: unknown): value is StudySettings {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    BOOL_KEYS.every((k) => typeof v[k] === 'boolean') &&
    NUMBER_KEYS.every((k) => typeof v[k] === 'number' && Number.isFinite(v[k] as number))
  );
}

export async function loadStudySettings(repo: SettingsRepository): Promise<StudySettings> {
  const r = await repo.get(KEY);
  if (isErr(r) || r.value === null) return DEFAULT_STUDY_SETTINGS;
  try {
    const parsed: unknown = JSON.parse(r.value);
    if (isStudySettings(parsed)) return parsed;
  } catch {
    // fall through to the default
  }
  return DEFAULT_STUDY_SETTINGS;
}

export async function saveStudySettings(repo: SettingsRepository, settings: StudySettings): Promise<void> {
  await repo.set(KEY, JSON.stringify(settings));
}
