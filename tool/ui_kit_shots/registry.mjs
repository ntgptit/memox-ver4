// tool/ui_kit_shots/registry.mjs — SINGLE SOURCE OF TRUTH for the MemoX UI-kit screen/state matrix.
//
// Every downstream artifact is GENERATED from this file — never hand-edit them:
//   index.html gallery  ← gen-gallery.mjs   (SCREENS array between the AUTOGEN markers)
//   shoot.mjs unit set   ← imported directly (no private registry)
//   specs/INDEX.md       ← gen-specs.mjs
//   shots/INDEX.md       ← gen-shots-index.mjs
// The verify:ui-kit gate fails when any of them drift from this registry.
//
// Fields per screen:
//   id     kebab id (gallery id, shoot unit, PNG prefix)
//   title  human label (gallery + specs + shots index)
//   group  window global + display group (Comp = () => window[group])
//   states FULL fixture list — the contract's state matrix; the CI gate renders ALL of these
//   sample fast local subset (npm run verify:ui-kit runs sample; CI runs full)
//
// Adding a screen/state = edit HERE, then `npm run gen:ui-kit` to regenerate all artifacts.

export const SCREENS = [
  { id: 'dashboard', title: 'Today', group: 'Dashboard',
    states: ['loaded', 'not-studied', 'goal-met', 'streak-reset', 'caught-up', 'create-sheet', 'empty', 'loading'],
    sample: null },
  { id: 'library', title: 'Library', group: 'Library',
    states: ['loaded', 'dense', 'empty', 'create-sheet', 'search-active', 'search-results', 'search-no-results', 'filter-applied', 'filter-sheet', 'selection', 'loading', 'offline'],
    sample: null },
  { id: 'subdeck-list', title: 'Subdeck List', group: 'SubdeckList',
    note: 'Browse and manage subdecks inside the current deck (subdecks only).',
    states: ['loaded', 'dense', 'deep', 'empty', 'search', 'no-results', 'selection', 'create-sheet', 'subdeck-actions', 'play', 'loading', 'offline', 'error'],
    sample: null },
  { id: 'flashcard-list', title: 'Flashcard List', group: 'FlashcardList',
    note: 'Browse, filter and manage flashcards in the current final deck (cards only).',
    states: ['loaded', 'dense', 'minimum-data', 'long-text', 'empty', 'search', 'no-results', 'filter-applied', 'selection', 'add-sheet', 'card-actions', 'delete-confirm', 'loading', 'offline', 'error'],
    sample: null },
  { id: 'deck-settings', title: 'Deck Settings', group: 'DeckSettings',
    note: 'Manage deck metadata and lifecycle actions (no content list).',
    states: ['action-sheet', 'rename', 'move', 'reset-confirm', 'delete-confirm'],
    sample: null },
  { id: 'deck-content-choice', title: 'Deck Content Choice', group: 'DeckContentChoice',
    note: 'Decide how a new, empty deck is organised (subdecks vs cards).',
    states: ['default'],
    sample: null },
  { id: 'flashcard-editor', title: 'Card Editor', group: 'FlashcardEditor',
    states: ['create', 'edit', 'validation', 'duplicate', 'additional-translation', 'audio-generating', 'submitting', 'submit-error', 'submit-success'],
    sample: null },
  { id: 'mode-picker', title: 'Mode Picker', group: 'ModePicker',
    states: ['default', 'scope-dropdown', 'not-enough'],
    sample: ['default', 'not-enough'] },
  { id: 'review-mode', title: 'Review', group: 'ReviewMode',
    states: ['browsing', 'editing', 'audio', 'loading', 'error', 'end'],
    sample: ['browsing', 'audio', 'loading', 'error', 'end'] },
  { id: 'match-mode', title: 'Match', group: 'MatchMode',
    states: ['playing', 'selected', 'correct', 'wrong', 'almost', 'complete'],
    sample: ['playing', 'complete'] },
  { id: 'guess-mode', title: 'Guess', group: 'GuessMode',
    states: ['waiting', 'correct', 'wrong', 'long-text', 'complete'],
    sample: ['waiting', 'long-text', 'complete'] },
  { id: 'recall-mode', title: 'Recall', group: 'RecallMode',
    states: ['before-reveal', 'revealed', 'forgot', 'remembered', 'complete'],
    sample: ['before-reveal', 'complete'] },
  { id: 'fill-mode', title: 'Fill', group: 'FillMode',
    states: ['waiting', 'typing', 'hint', 'correct', 'wrong', 'complete'],
    sample: ['waiting', 'typing', 'complete'] },
  { id: 'player', title: 'Player', group: 'Player',
    states: ['playing', 'paused', 'speed', 'error', 'end'],
    sample: ['playing', 'error', 'end'] },
  { id: 'study-result', title: 'Study Result', group: 'StudyResult',
    states: ['standard', 'goal-met', 'goal-missed', 'many-wrong', 'finalizing', 'retry-finalize', 'finalize-error'],
    sample: ['standard', 'goal-met', 'many-wrong', 'finalize-error'] },
  { id: 'search', title: 'Search', group: 'Search',
    states: ['empty-recent', 'results', 'filtered', 'no-results', 'loading'],
    sample: ['empty-recent', 'results', 'no-results', 'loading'] },
  { id: 'statistics', title: 'Stats', group: 'Statistics',
    states: ['loaded', 'scope-switch', 'insufficient', 'loading', 'error'],
    sample: ['loaded', 'insufficient', 'loading', 'error'] },
  { id: 'reminder', title: 'Reminders', group: 'Reminder',
    states: ['on', 'off', 'time-picker'],
    sample: ['on', 'off'] },
  { id: 'account-sync', title: 'Account & Sync', group: 'AccountSync',
    states: ['signed-out', 'signed-in', 'syncing', 'conflict', 'offline'],
    sample: ['signed-out', 'signed-in', 'conflict', 'offline'] },
  { id: 'theme', title: 'Theme', group: 'Theme',
    states: ['light', 'dark', 'accent-size'],
    sample: ['light', 'accent-size'] },
  { id: 'import', title: 'Import', group: 'Import',
    states: ['source', 'mapping', 'preview', 'dup-warning', 'importing', 'import-error', 'done'],
    sample: ['source', 'mapping', 'importing', 'import-error', 'done'] },
  { id: 'export', title: 'Export', group: 'Export',
    states: ['config', 'exporting', 'export-error', 'done'],
    sample: null },
  { id: 'languages', title: 'Language Pairs', group: 'Languages',
    states: ['list', 'one', 'empty', 'add', 'remove'],
    sample: null },
  { id: 'study-session', title: 'Study Session (5 stages)', group: 'StudySession',
    states: ['stage1-review', 'stage2-match', 'stage3-guess', 'stage4-recall', 'stage5-fill', 'relearn', 'due-review', 'exit', 'resume-error', 'answer-save-error'],
    sample: ['stage1-review', 'resume-error', 'answer-save-error'] },
  { id: 'settings', title: 'Settings', group: 'Settings',
    states: ['loaded', 'study-hub', 'study-worddisplay', 'study-srs', 'study-mode', 'study-voice', 'value-picker'],
    sample: ['loaded', 'study-hub', 'study-worddisplay', 'study-srs', 'study-mode', 'study-voice'] },
  { id: 'app-bar', title: 'App Bar (shared)', group: 'AppBar', spec: false, // component gallery, not a screen — no screen spec
    states: ['root-top', 'root-scrolled', 'root-unread', 'nested', 'nested-overflow', 'search', 'selection', 'modal'],
    sample: null },
];

// A screen whose sample === states passes `sample: null` (means "sample is the full set").
export const sampleOf = (s) => s.sample || s.states;
export const totals = () => ({
  screens: SCREENS.length,
  states: SCREENS.reduce((a, s) => a + s.states.length, 0),
  sample: SCREENS.reduce((a, s) => a + sampleOf(s).length, 0),
});
