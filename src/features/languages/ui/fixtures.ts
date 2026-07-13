/**
 * Languages slice (WBS 3.3) — view model + state-matrix fixtures.
 *
 * The screen is driven entirely by {@link LanguagesData}; these fixtures cover the
 * canonical states (contract §6) so the component/interaction/a11y tests and the
 * visual golden all render from one shared source. Fixtures are display data only —
 * the real numbers come from the repositories (WBS 3.1/3.2) at runtime.
 */

/** A language pair as the screen renders it (display strings, not the raw entity). */
export interface LanguagePairView {
  readonly id: string;
  /** Language being learned, e.g. `Korean`. */
  readonly learning: string;
  /** Native/meaning language, e.g. `English`. */
  readonly native: string;
  /** Decks filed under this pair (drives the row subtitle; counted from 3.2). */
  readonly deckCount: number;
}

/** The screen's data states: still loading, failed (recoverable), or ready. */
export type LanguagesData =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly pairs: readonly LanguagePairView[] };

/** Title shown for a pair, e.g. `Korean → English`. */
export function pairTitle(p: LanguagePairView): string {
  return `${p.learning} → ${p.native}`;
}

/** Subtitle shown for a pair, e.g. `12 decks` / `1 deck` / `No decks yet`. */
export function pairSubtitle(p: LanguagePairView): string {
  if (p.deckCount === 0) return 'No decks yet';
  return `${p.deckCount} ${p.deckCount === 1 ? 'deck' : 'decks'}`;
}

const PAIRS: readonly LanguagePairView[] = [
  { id: 'lp-ko-en', learning: 'Korean', native: 'English', deckCount: 12 },
  { id: 'lp-ja-en', learning: 'Japanese', native: 'English', deckCount: 4 },
];

/** Fixtures keyed by canonical state name (contract §6 + the loading/error edges). */
export const LANGUAGES_FIXTURES = {
  loading: { status: 'loading' } as LanguagesData,
  error: { status: 'error', message: "Couldn't load your language pairs." } as LanguagesData,
  empty: { status: 'ready', pairs: [] } as LanguagesData,
  one: { status: 'ready', pairs: PAIRS.slice(0, 1) } as LanguagesData,
  list: { status: 'ready', pairs: PAIRS } as LanguagesData,
  /** A long-text / large-count edge for overflow + pluralisation checks. */
  longText: {
    status: 'ready',
    pairs: [
      { id: 'lp-long', learning: 'Standard Modern Cantonese', native: 'Brazilian Portuguese', deckCount: 1 },
      { id: 'lp-big', learning: 'Norwegian Bokmål', native: 'English', deckCount: 987 },
    ],
  } as LanguagesData,
} satisfies Record<string, LanguagesData>;

export type LanguagesFixtureKey = keyof typeof LANGUAGES_FIXTURES;
