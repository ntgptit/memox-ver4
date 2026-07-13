/**
 * Session UI (WBS 5.4+) — the study-session screens. Currently the mode-picker slice
 * (prop-driven screen + controller + container + model/fixtures).
 */

export { ModePickerScreen, type ModePickerScreenProps } from './mode-picker-screen';
export { ModePickerContainer } from './mode-picker-container';
export { useModePicker, type ModePickerDeps, type ModePickerController, type ScopeCounts } from './use-mode-picker';
export {
  MODE_CHOICES,
  SCOPE_CHOICES,
  MIN_WORDS,
  WORDS_PER_ROUND,
  scopeLabel,
  type StudyScope,
  type ModeChoice,
  type ScopeChoice,
} from './mode-picker-model';
export { MODE_PICKER_FIXTURES, type ModePickerFixtureKey, type ModePickerFixture } from './mode-picker-fixtures';
