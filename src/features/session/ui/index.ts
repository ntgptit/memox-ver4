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

export { StudyResultScreen, type StudyResultScreenProps } from './study-result-screen';
export { StudyResultContainer, type StudyResultContainerProps } from './study-result-container';
export {
  useStudyResult,
  deriveSummary,
  deriveKind,
  deriveStreak,
  formatDuration,
  dayKey,
  RESULT_GOAL_MINUTES,
  MANY_WRONG_THRESHOLD,
  ALMOST_THERE_MINUTES,
  type StudyResultDeps,
  type StudyResultController,
} from './use-study-result';
export {
  STUDY_RESULT_FIXTURES,
  STUDY_RESULT_SUMMARY,
  type StudyResultData,
  type StudyResultSummary,
  type StudyResultKind,
  type StudyResultFixture,
  type StudyResultFixtureKey,
  type StudyResultUiState,
} from './study-result-fixtures';
export { ResultHero, StreakGoalCard, FinalizingBody, Cta } from './study-result-components';

export { ReviewModeScreen, type ReviewModeScreenProps } from './review-mode-screen';
export { ReviewModeContainer } from './review-mode-container';
export { useReviewMode, type ReviewModeDeps, type ReviewModeController } from './use-review-mode';
export {
  REVIEW_MODE_FIXTURES,
  type ReviewModeData,
  type ReviewModeFixture,
  type ReviewModeFixtureKey,
  type ReviewModeUiState,
} from './review-mode-fixtures';

export { StudySessionScreen, type StudySessionScreenProps } from './study-session-screen';
export { StudySessionContainer } from './study-session-container';
export {
  useStudySession,
  normalizeAnswer,
  buildShellOptions,
  type StudySessionDeps,
  type StudySessionController,
  type StudySessionMode,
} from './use-study-session';
export {
  STUDY_SESSION_META,
  STAGE_CONTENT,
  RECALL_TERM,
  STUDY_SESSION_STATES,
  type StudySessionUiState,
  type StudySessionFixtureKey,
  type StageMeta,
  type StageContent,
} from './study-session-fixtures';
export {
  PromptCard,
  StageReview,
  StageMatch,
  StageGuess,
  StageRecall,
  StageFill,
  ExitDialog,
  AnswerSaveErrorDialog,
  ResumeErrorState,
} from './study-session-components';

export { PlayerScreen, type PlayerScreenProps } from './player-screen';
export { PlayerContainer } from './player-container';
export { usePlayer, type PlayerDeps, type PlayerController } from './use-player';
export {
  PLAYER_FIXTURES,
  PLAYER_SPEEDS,
  type PlayerData,
  type PlayerFixture,
  type PlayerFixtureKey,
  type PlayerSpeed,
  type PlayerUiState,
} from './player-fixtures';
