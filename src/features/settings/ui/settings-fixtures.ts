/**
 * Settings fixtures (WBS 10.1) — IDENTICAL to the kit's `_features/settings/Settings.jsx`
 * copy (root rows, study-hub rows, child rows, picker options); the parity gate
 * diffs the app against the kit shots, so data drift here is itself a defect.
 */

import { DEFAULT_STUDY_SETTINGS, type StudySettings } from '../data/study-settings';

export type SettingsUiState =
  | 'loaded'
  | 'study-hub'
  | 'study-worddisplay'
  | 'study-srs'
  | 'study-mode'
  | 'study-voice'
  | 'value-picker';

/** The study child screens the hub links to. */
export type StudyScreenKey = 'worddisplay' | 'srs' | 'mode' | 'voice';

/** Kit ValuePickerSheet options. */
export const WORDS_PER_ROUND_OPTIONS = ['5', '10', '20'] as const;

/** Kit root APP rows (sub copy is the kit's static scaffold fixture). */
export const SETTINGS_ROOT = {
  profile: { name: 'Linh Tran', email: 'linh@memox.app' },
  study: { icon: 'school', title: 'Study settings', sub: 'Languages · display · SRS · modes · voice' },
  app: [
    { key: 'theme', icon: 'palette', title: 'Theme', sub: 'Light · default accent' },
    { key: 'reminders', icon: 'notifications', title: 'Reminders', sub: '13:00 · Mon–Sun' },
    { key: 'backup', icon: 'backup', title: 'Backup / Restore', sub: 'Local file · on device' },
    { key: 'export', icon: 'download', title: 'Export cards', sub: 'CSV · Anki · JSON' },
  ],
} as const;

/** Kit study-hub rows. */
export const STUDY_HUB_ROWS = [
  { key: 'languages', icon: 'translate', title: 'Language pairs', sub: '한국어 → English · +1 more' },
  { key: 'worddisplay', icon: 'format_shapes', title: 'Word display', sub: 'Native meaning · color by gender' },
  { key: 'srs', icon: 'schedule', title: 'Spaced repetition', sub: 'Boxes: 8 · Notifications on' },
  { key: 'mode', icon: 'tune', title: 'Mode settings', sub: '5 words/round · shuffle' },
  { key: 'voice', icon: 'record_voice_over', title: 'Voice', sub: 'TTS on · STT off' },
] as const;

export interface SettingsFixture {
  ui: SettingsUiState;
  settings: StudySettings;
}

export const SETTINGS_FIXTURES: Record<SettingsUiState, SettingsFixture> = {
  loaded: { ui: 'loaded', settings: DEFAULT_STUDY_SETTINGS },
  'study-hub': { ui: 'study-hub', settings: DEFAULT_STUDY_SETTINGS },
  'study-worddisplay': { ui: 'study-worddisplay', settings: DEFAULT_STUDY_SETTINGS },
  'study-srs': { ui: 'study-srs', settings: DEFAULT_STUDY_SETTINGS },
  'study-mode': { ui: 'study-mode', settings: DEFAULT_STUDY_SETTINGS },
  'study-voice': { ui: 'study-voice', settings: DEFAULT_STUDY_SETTINGS },
  'value-picker': { ui: 'value-picker', settings: DEFAULT_STUDY_SETTINGS },
};

export type SettingsFixtureKey = SettingsUiState;
export { DEFAULT_STUDY_SETTINGS };
export type { StudySettings };
