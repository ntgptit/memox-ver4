/**
 * Settings UI (WBS 2.3) — the persisted theme provider + the theme settings screen.
 */

export { PersistedThemeProvider } from './persisted-theme-provider';
export { ThemeScreen } from './theme-screen';

export { ReminderScreen, type ReminderScreenProps } from './reminder-screen';
export { ReminderContainer } from './reminder-container';
export { useReminder, type ReminderDeps, type ReminderController } from './use-reminder';
export { SettingsScreen, ValuePickerSheet, type SettingsScreenProps } from './settings-screen';
export { SettingsRootContainer, StudySettingsContainer } from './settings-container';
export { useSettings, type SettingsDeps, type SettingsController } from './use-settings';
export {
  SETTINGS_FIXTURES,
  SETTINGS_ROOT,
  STUDY_HUB_ROWS,
  WORDS_PER_ROUND_OPTIONS,
  DEFAULT_STUDY_SETTINGS,
  type SettingsFixture,
  type SettingsFixtureKey,
  type SettingsUiState,
  type StudyScreenKey,
  type StudySettings,
} from './settings-fixtures';

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
