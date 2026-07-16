// tool/ui_kit_shots/registry.mjs — SINGLE SOURCE OF TRUTH for the MemoX UI-kit screen matrix.
//
// Every downstream artifact is GENERATED from this file — never hand-edit them:
//   index.html gallery   ← gen.mjs  (SCREENS array between the AUTOGEN markers)
//   specs/<id>.md + INDEX ← gen.mjs  (contract artifacts; component map auto-derived from JSX)
//   shots/INDEX.md        ← gen.mjs
//   shoot.mjs unit set    ← imported directly (no private registry)
// The verify:ui-kit gate fails when any of them drift from this registry.
//
// Fields per screen:
//   id/title/group  identity (Comp = () => window[group])
//   archetype       one of the contract archetypes (List/Detail/Form/Dashboard/Search/Selection/
//                   Settings/Focused task-study flow)
//   objective       the single primary user objective (contract step 1)
//   cta             the single primary CTA label, or null for read/navigation surfaces
//   note?           one-line description (galleries)
//   spec?           false = component gallery, not a screen spec (excluded from specs INDEX)
//   states          FULL fixture list = the contract state matrix; the CI gate renders ALL
//   sample          fast local subset (verify:ui-kit --sample); null means "= states"
//
// Adding a screen/state = edit HERE, then `npm run gen:ui-kit` to regenerate every artifact.

export const SCREENS = [
  { id: 'dashboard', title: 'Today', group: 'Dashboard',
    archetype: 'Dashboard', objective: 'Resume studying: surface what is due and the fastest way back in.', cta: 'Start review',
    states: ['loaded', 'not-studied', 'goal-met', 'streak-reset', 'caught-up', 'create-sheet', 'empty', 'loading'],
    sample: null },
  { id: 'library', title: 'Library', group: 'Library',
    archetype: 'List', objective: 'Browse and manage decks at any level: the library root (parentId null) and the decks nested inside a deck.', cta: 'Create deck',
    note: 'ONE deck-list screen for every level. Root mode (bottom-nav tab) lists top-level decks; nested-* states (pushed, back + breadcrumb) list a deck’s child decks — same model, chrome differs by level. Absorbs the retired subdeck-list screen; nested-* states keep the frozen subdeck-list/* node ids.',
    states: ['loaded', 'dense', 'empty', 'create-sheet', 'search-active', 'search-results', 'search-no-results', 'filter-applied', 'filter-sheet', 'selection', 'loading', 'offline', 'nested-loaded', 'nested-dense', 'nested-deep', 'nested-empty', 'nested-search', 'nested-no-results', 'nested-selection', 'nested-create-sheet', 'nested-subdeck-actions', 'nested-long-menu', 'nested-play', 'nested-loading', 'nested-offline', 'nested-error', 'nested-not-found'],
    sample: ['loaded', 'empty', 'nested-loaded', 'nested-subdeck-actions', 'nested-not-found'] },
  { id: 'flashcard-list', title: 'Flashcard List', group: 'FlashcardList',
    archetype: 'List', objective: 'Browse, filter and manage the cards in a final deck.', cta: 'Add card',
    note: 'Browse, filter and manage flashcards in the current final deck (cards only).',
    states: ['loaded', 'dense', 'minimum-data', 'long-text', 'empty', 'search', 'no-results', 'filter-applied', 'selection', 'add-sheet', 'card-actions', 'delete-confirm', 'loading', 'offline', 'error', 'not-found'],
    sample: null },
  { id: 'deck-settings', title: 'Deck Settings', group: 'DeckSettings',
    archetype: 'Settings', objective: 'Manage a deck’s metadata and lifecycle actions.', cta: 'Save',
    note: 'Manage deck metadata and lifecycle actions (no content list).',
    states: ['action-sheet', 'rename', 'move', 'reset-confirm', 'delete-confirm'],
    sample: null },
  { id: 'deck-content-choice', title: 'Deck Content Choice', group: 'DeckContentChoice',
    archetype: 'Form', objective: 'Name a new deck, choose how it is organised, and create it in one step.', cta: 'Create deck',
    note: 'Name + organise + create a new deck on one screen: radio option cards, one primary CTA.',
    states: ['default', 'subdecks', 'validation', 'duplicate', 'submitting', 'submit-error'],
    sample: ['default', 'duplicate'] },
  { id: 'create-deck-firstrun', title: 'Create Deck · First run', group: 'CreateDeckFirstRun',
    archetype: 'Focused task/study flow', objective: 'Create the first deck on a fresh install: learning setup then deck name — full screen, no dialog.', cta: 'Create deck',
    note: 'First-run only (§4–7): landing → Step 1 learning setup → Step 2 first deck. Create makes an EMPTY deck (no card/nested/Default-view). Outcome states compose where the flow lands (Library+callout / Import / Dashboard-empty).',
    states: ['landing', 'step1', 'step1-validation', 'step2', 'step2-optional', 'duplicate', 'submitting', 'submit-failure', 'resume-draft', 'success', 'import-branch', 'not-now'],
    sample: ['landing', 'step1', 'step2', 'submitting', 'success'] },
  { id: 'flashcard-editor', title: 'Card Editor', group: 'FlashcardEditor',
    archetype: 'Form', objective: 'Create or edit a flashcard (term, meaning, tags, audio).', cta: 'Save',
    states: ['create', 'edit', 'validation', 'duplicate', 'additional-translation', 'audio-generating', 'keyboard-open', 'submitting', 'submit-error', 'submit-success'],
    sample: null },
  { id: 'mode-picker', title: 'Mode Picker', group: 'ModePicker',
    archetype: 'Selection', objective: 'Choose a study mode and scope, then start a session.', cta: 'Start session',
    states: ['default', 'scope-dropdown', 'not-enough'],
    sample: ['default', 'not-enough'] },
  { id: 'review-mode', title: 'Review', group: 'ReviewMode',
    archetype: 'Focused task/study flow', objective: 'Browse the round’s cards freely before committing to grading.', cta: 'Study now',
    states: ['browsing', 'editing', 'audio', 'loading', 'error', 'end'],
    sample: ['browsing', 'audio', 'loading', 'error', 'end'] },
  { id: 'match-mode', title: 'Match', group: 'MatchMode',
    archetype: 'Focused task/study flow', objective: 'Match terms to meanings (session stage 2).', cta: 'Next round',
    states: ['playing', 'selected', 'correct', 'wrong', 'almost', 'complete'],
    sample: ['playing', 'complete'] },
  { id: 'guess-mode', title: 'Guess', group: 'GuessMode',
    archetype: 'Focused task/study flow', objective: 'Pick the correct meaning for a term (session stage 3).', cta: 'Next round',
    states: ['waiting', 'correct', 'wrong', 'long-text', 'complete'],
    sample: ['waiting', 'long-text', 'complete'] },
  { id: 'recall-mode', title: 'Recall', group: 'RecallMode',
    archetype: 'Focused task/study flow', objective: 'Self-grade recall of a term (session stage 4).', cta: 'Got it',
    states: ['before-reveal', 'revealed', 'forgot', 'remembered', 'complete'],
    sample: ['before-reveal', 'complete'] },
  { id: 'fill-mode', title: 'Fill', group: 'FillMode',
    archetype: 'Focused task/study flow', objective: 'Type the term from its meaning (session stage 5).', cta: 'Check',
    states: ['waiting', 'typing', 'hint', 'correct', 'wrong', 'complete'],
    sample: ['waiting', 'typing', 'complete'] },
  { id: 'player', title: 'Player', group: 'Player',
    archetype: 'Focused task/study flow', objective: 'Play a deck’s cards as hands-free audio.', cta: null,
    states: ['playing', 'paused', 'speed', 'error', 'end'],
    sample: ['playing', 'error', 'end'] },
  { id: 'study-result', title: 'Study Result', group: 'StudyResult',
    archetype: 'Detail', objective: 'Summarise a finished session and route to what is next.', cta: 'Continue studying',
    states: ['standard', 'goal-met', 'goal-missed', 'many-wrong', 'finalizing', 'retry-finalize', 'finalize-error'],
    sample: ['standard', 'goal-met', 'many-wrong', 'finalize-error'] },
  { id: 'search', title: 'Search', group: 'Search',
    archetype: 'Search', objective: 'Find a card or deck by word or meaning.', cta: null,
    states: ['empty-recent', 'results', 'filtered', 'no-results', 'loading'],
    sample: ['empty-recent', 'results', 'no-results', 'loading'] },
  { id: 'statistics', title: 'Stats', group: 'Statistics',
    archetype: 'Dashboard', objective: 'Review study progress, streaks and retention.', cta: null,
    states: ['loaded', 'scope-switch', 'insufficient', 'loading', 'error'],
    sample: ['loaded', 'insufficient', 'loading', 'error'] },
  { id: 'reminder', title: 'Reminders', group: 'Reminder',
    archetype: 'Settings', objective: 'Configure daily study reminders.', cta: null,
    states: ['on', 'off', 'time-picker', 'permission-denied', 'permission-denied-expansion'],
    sample: ['on', 'off'] },
  { id: 'account-sync', title: 'Account & Sync', group: 'AccountSync',
    archetype: 'Detail', objective: 'Sign in and manage cloud sync of decks and progress.', cta: 'Sign in',
    states: ['signed-out', 'signed-in', 'syncing', 'conflict', 'offline', 'sign-in-form', 'sign-in-keyboard', 'expansion'],
    sample: ['signed-out', 'signed-in', 'conflict', 'offline'] },
  { id: 'theme', title: 'Theme', group: 'Theme',
    archetype: 'Settings', objective: 'Choose appearance (light/dark) and accent colour.', cta: null,
    states: ['light', 'dark', 'accent-size'],
    sample: ['light', 'accent-size'] },
  { id: 'import', title: 'Import', group: 'Import',
    archetype: 'Form', objective: 'Import cards from a file or pasted text into a deck.', cta: 'Import',
    states: ['source', 'mapping', 'preview', 'dup-warning', 'importing', 'import-error', 'done'],
    sample: ['source', 'mapping', 'importing', 'import-error', 'done'] },
  { id: 'export', title: 'Export', group: 'Export',
    archetype: 'Form', objective: 'Export a deck’s cards to a shareable file format.', cta: 'Export',
    states: ['config', 'exporting', 'export-error', 'done'],
    sample: null },
  { id: 'languages', title: 'Language Pairs', group: 'Languages',
    archetype: 'List', objective: 'Manage learning↔native language pairs.', cta: 'Add language pair',
    states: ['list', 'one', 'empty', 'add', 'remove', 'scripts'],
    sample: null },
  { id: 'study-session', title: 'Study Session (5 stages)', group: 'StudySession',
    archetype: 'Focused task/study flow', objective: 'Run the 5-stage study session end to end.', cta: 'Next',
    states: ['stage1-review', 'stage2-match', 'stage3-guess', 'stage4-recall', 'stage5-fill', 'relearn', 'due-review', 'exit', 'resume-error', 'answer-save-error'],
    sample: ['stage1-review', 'resume-error', 'answer-save-error'] },
  { id: 'settings', title: 'Settings', group: 'Settings',
    archetype: 'Settings', objective: 'Configure the app and study behaviour (navigation hub).', cta: null,
    states: ['loaded', 'study-hub', 'study-worddisplay', 'study-srs', 'study-mode', 'study-voice', 'value-picker'],
    sample: ['loaded', 'study-hub', 'study-worddisplay', 'study-srs', 'study-mode', 'study-voice'] },
  { id: 'app-bar', title: 'App Bar (shared)', group: 'AppBar', spec: false,
    archetype: 'Detail', objective: 'Reference gallery for the one MxContextualAppBar across its variants.', cta: null,
    states: ['root-top', 'root-scrolled', 'root-unread', 'nested', 'nested-overflow', 'search', 'selection', 'modal'],
    sample: null },
];

export const sampleOf = (s) => s.sample || s.states;
export const totals = () => ({
  screens: SCREENS.length,
  states: SCREENS.reduce((a, s) => a + s.states.length, 0),
  sample: SCREENS.reduce((a, s) => a + sampleOf(s).length, 0),
});
