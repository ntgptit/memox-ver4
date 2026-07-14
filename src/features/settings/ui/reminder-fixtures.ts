/**
 * Reminder slice (WBS 8.2) — view model + state-matrix fixtures. Mirrors the
 * kit's `_features/reminder/Reminder.jsx` VERBATIM: 13:00, all weekday chips
 * selected while on, the hour column 11–15 (sel 13) and minutes 00/15/30/45
 * (sel 00). 3 states (contract §6).
 */

export const REMINDER_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Kit picker columns, verbatim. */
export const PICKER_HOURS = ['11', '12', '13', '14', '15'] as const;
export const PICKER_MINUTES = ['00', '15', '30', '45'] as const;

export interface ReminderConfig {
  readonly enabled: boolean;
  /** 24h "HH:MM". */
  readonly time: string;
  /** Mon-first weekday toggles. */
  readonly days: readonly boolean[];
}

export const DEFAULT_REMINDER: ReminderConfig = {
  enabled: true,
  time: '13:00',
  days: [true, true, true, true, true, true, true],
};

export type ReminderUiState = 'on' | 'off' | 'time-picker';

export interface ReminderFixture {
  readonly config: ReminderConfig;
  readonly ui: ReminderUiState;
}

/** Fixtures keyed by canonical state name (contract §6 — 3 states). */
export const REMINDER_FIXTURES: Record<ReminderUiState, ReminderFixture> = {
  on: { config: DEFAULT_REMINDER, ui: 'on' },
  off: { config: { ...DEFAULT_REMINDER, enabled: false }, ui: 'off' },
  'time-picker': { config: DEFAULT_REMINDER, ui: 'time-picker' },
};

export type ReminderFixtureKey = keyof typeof REMINDER_FIXTURES;
