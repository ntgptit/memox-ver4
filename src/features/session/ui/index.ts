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

export { RecallModeScreen, type RecallModeScreenProps, type RecallPhase } from './recall-mode-screen';
export { RecallModeContainer } from './recall-mode-container';
export { useRecallMode, type RecallModeDeps, type RecallModeController } from './use-recall-mode';
export { RECALL_FIXTURES, type RecallFixtureKey, type RecallFixture } from './recall-mode-fixtures';

export { GuessModeScreen, type GuessModeScreenProps, type GuessPhase } from './guess-mode-screen';
export { GuessModeContainer } from './guess-mode-container';
export { useGuessMode, type GuessModeDeps, type GuessModeController } from './use-guess-mode';
export { buildOptions, type GuessOptions } from './guess-options';
export { GUESS_FIXTURES, type GuessFixtureKey, type GuessFixture } from './guess-mode-fixtures';
export { ProgressHeader, StudyPromptCard, FeedbackNote, RoundComplete } from './study-chrome';

export { FillModeScreen, type FillModeScreenProps, type FillPhase } from './fill-mode-screen';
export { FillModeContainer } from './fill-mode-container';
export { useFillMode, type FillModeDeps, type FillModeController } from './use-fill-mode';
export { FILL_FIXTURES, type FillFixtureKey, type FillFixture } from './fill-mode-fixtures';

export {
  MatchModeScreen,
  type MatchModeScreenProps,
  type MatchPhase,
  type MatchTileView,
  type TileTone,
} from './match-mode-screen';
export { MatchModeContainer } from './match-mode-container';
export { useMatchMode, type MatchModeDeps, type MatchModeController } from './use-match-mode';
export { buildBoard, BOARD_SIZE, type MatchBoard, type MatchTile } from './match-board';
export { MATCH_FIXTURES, type MatchFixtureKey, type MatchFixture } from './match-mode-fixtures';
