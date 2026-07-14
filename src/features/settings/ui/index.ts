/**
 * Settings UI (WBS 2.3) — the persisted theme provider + the theme settings screen.
 */

export { PersistedThemeProvider } from './persisted-theme-provider';
export { ThemeScreen } from './theme-screen';

export { ReminderScreen, type ReminderScreenProps } from './reminder-screen';
export { ReminderContainer } from './reminder-container';
export { useReminder, type ReminderDeps, type ReminderController } from './use-reminder';
export {
  REMINDER_FIXTURES,
  REMINDER_WEEKDAYS,
  PICKER_HOURS,
  PICKER_MINUTES,
  DEFAULT_REMINDER,
  type ReminderConfig,
  type ReminderFixture,
  type ReminderFixtureKey,
  type ReminderUiState,
} from './reminder-fixtures';
