/**
 * Library slice (WBS 3.4) — view model + state-matrix fixtures.
 *
 * Fixture data mirrors the kit's `_features/library/components/libFixtures.jsx`
 * VERBATIM (deck names, counts, icons) so the app goldens stay pixel-comparable
 * with the kit reference shots. Display data only — live numbers come from the
 * repositories (3.2 / 4.2 / 5.2) via `use-library`.
 */

export interface LibraryDeckView {
  readonly id: string;
  readonly icon: string;
  readonly name: string;
  readonly cards: number;
  readonly due?: number;
  readonly newCards?: number;
  readonly upToDate?: boolean;
  readonly subdecks: number;
}

export interface LibrarySubdeckView {
  readonly id: string;
  readonly icon: string;
  readonly name: string;
  readonly cards: number;
  readonly due?: number;
  readonly newCards?: number;
  readonly upToDate?: boolean;
  /** Parent deck title, shown by search results ("in Korean TOPIK I · N cards"). */
  readonly parent?: string;
}

/** Status segment for the deck meta line: label + semantic tone. */
export function deckStatus(d: {
  due?: number;
  newCards?: number;
}): { label: string; tone: 'warning' | 'accent' | 'success' } {
  if (d.due !== undefined && d.due > 0) return { label: `${d.due > 99 ? '99+' : d.due} due`, tone: 'warning' };
  if (d.newCards !== undefined && d.newCards > 0) return { label: `${d.newCards} new`, tone: 'accent' };
  return { label: 'Up to date', tone: 'success' };
}

/** Kit `libFixtures.jsx` DECKS, verbatim. */
export const LIBRARY_DECKS: readonly LibraryDeckView[] = [
  { id: 'd-topik', icon: 'translate', name: 'Korean TOPIK I', cards: 486, due: 48, subdecks: 5 },
  { id: 'd-grammar', icon: 'menu_book', name: 'Basic Grammar', cards: 180, newCards: 23, subdecks: 0 },
  { id: 'd-conversation', icon: 'record_voice_over', name: 'Daily Conversation', cards: 150, upToDate: true, subdecks: 3 },
  { id: 'd-hanja', icon: 'history_edu', name: 'Hanja Roots', cards: 320, due: 12, subdecks: 0 },
  { id: 'd-travel', icon: 'travel_explore', name: 'Travel Phrases', cards: 96, newCards: 8, subdecks: 2 },
  { id: 'd-business', icon: 'work', name: 'Business Korean', cards: 210, upToDate: true, subdecks: 0 },
];

/** Kit DENSE: 22 rows cycling DECKS, first two stress long-title/large-count. */
export const LIBRARY_DENSE: readonly LibraryDeckView[] = Array.from({ length: 22 }, (_, i) => {
  const b = LIBRARY_DECKS[i % LIBRARY_DECKS.length];
  return {
    ...b,
    id: `${b.id}-${i}`,
    name:
      i < 2
        ? 'Advanced Idiomatic Expressions & Formal Register Workbook'
        : b.name + (i >= LIBRARY_DECKS.length ? ` · set ${i - LIBRARY_DECKS.length + 2}` : ''),
    cards: i === 1 ? 1280 : b.cards,
    due: i === 0 ? 128 : b.due,
  };
});

/** Kit SUBDECKS (search results show [0] and [2] with their parent deck). */
export const LIBRARY_SUBDECKS: readonly LibrarySubdeckView[] = [
  { id: 's-greet', icon: 'waving_hand', name: 'Greetings & introductions', cards: 42, due: 8, parent: 'Korean TOPIK I' },
  { id: 's-numbers', icon: 'numbers', name: 'Numbers & counting', cards: 55, upToDate: true, parent: 'Korean TOPIK I' },
  { id: 's-family', icon: 'diversity_3', name: 'Family & relationships', cards: 38, newCards: 6, parent: 'Korean TOPIK I' },
];

/** Kit recent-search fixture (search-active state). */
export const LIBRARY_RECENTS: readonly string[] = ['korean topik', 'grammar', 'hanja'];

/** The screen's data states. `offline` keeps the saved decks usable. */
export type LibraryData =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly decks: readonly LibraryDeckView[]; readonly offline?: boolean };

/** Preview/testing UI mode — mirrors the kit's 12-state matrix. */
export type LibraryUiState =
  | 'loaded'
  | 'dense'
  | 'empty'
  | 'create-sheet'
  | 'search-active'
  | 'search-results'
  | 'search-no-results'
  | 'filter-applied'
  | 'filter-sheet'
  | 'selection'
  | 'loading'
  | 'offline';

export interface LibraryFixture {
  readonly data: LibraryData;
  readonly ui: LibraryUiState;
}

/** Fixtures keyed by canonical state name (contract §6). */
export const LIBRARY_FIXTURES: Record<LibraryUiState, LibraryFixture> = {
  loaded: { data: { status: 'ready', decks: LIBRARY_DECKS }, ui: 'loaded' },
  dense: { data: { status: 'ready', decks: LIBRARY_DENSE }, ui: 'dense' },
  empty: { data: { status: 'ready', decks: [] }, ui: 'empty' },
  'create-sheet': { data: { status: 'ready', decks: LIBRARY_DECKS.slice(0, 3) }, ui: 'create-sheet' },
  'search-active': { data: { status: 'ready', decks: LIBRARY_DECKS }, ui: 'search-active' },
  'search-results': { data: { status: 'ready', decks: LIBRARY_DECKS }, ui: 'search-results' },
  'search-no-results': { data: { status: 'ready', decks: LIBRARY_DECKS }, ui: 'search-no-results' },
  'filter-applied': { data: { status: 'ready', decks: LIBRARY_DECKS }, ui: 'filter-applied' },
  'filter-sheet': { data: { status: 'ready', decks: LIBRARY_DECKS.slice(0, 3) }, ui: 'filter-sheet' },
  selection: { data: { status: 'ready', decks: LIBRARY_DECKS }, ui: 'selection' },
  loading: { data: { status: 'loading' }, ui: 'loading' },
  offline: { data: { status: 'ready', decks: LIBRARY_DECKS, offline: true }, ui: 'offline' },
};

export type LibraryFixtureKey = keyof typeof LIBRARY_FIXTURES;
