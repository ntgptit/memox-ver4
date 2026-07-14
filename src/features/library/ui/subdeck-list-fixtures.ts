/**
 * Subdeck-list slice (WBS 3.5) — view model + state-matrix fixtures. Mirrors the
 * kit's `_features/subdeck-list/components/subdeckFixtures.jsx` VERBATIM. Domain:
 * Deck › Subdeck (no cards on this screen). A subdeck IS a deck one level down,
 * so it reuses {@link LibrarySubdeckView}'s shape via its own view type.
 */

import type { BreadcrumbItem } from '@/design-system';

export interface SubdeckView {
  readonly id: string;
  readonly icon: string;
  readonly name: string;
  readonly cards: number;
  readonly due?: number;
  readonly newCards?: number;
  readonly upToDate?: boolean;
}

/** Kit SUBDECKS, verbatim. */
export const SUBDECK_LIST: readonly SubdeckView[] = [
  { id: 's-greet', icon: 'waving_hand', name: 'Greetings & introductions', cards: 42, due: 8 },
  { id: 's-numbers', icon: 'numbers', name: 'Numbers & counting', cards: 55, upToDate: true },
  { id: 's-family', icon: 'diversity_3', name: 'Family & relationships', cards: 38, newCards: 6 },
  { id: 's-food', icon: 'restaurant', name: 'Food & dining', cards: 47, due: 15 },
  { id: 's-directions', icon: 'directions', name: 'Directions & transport', cards: 35, upToDate: true },
];

/** Kit DENSE: 20 rows cycling SUBDECKS; first two stress long-title/large-count. */
export const SUBDECK_DENSE: readonly SubdeckView[] = Array.from({ length: 20 }, (_, i) => {
  const b = SUBDECK_LIST[i % SUBDECK_LIST.length];
  return {
    ...b,
    id: `${b.id}-${i}`,
    name:
      i < 2
        ? 'Formal & Honorific Speech Registers — Advanced Workbook'
        : b.name + (i >= SUBDECK_LIST.length ? ` · set ${i - SUBDECK_LIST.length + 2}` : ''),
    cards: i === 1 ? 1280 : b.cards,
    due: i === 0 ? 128 : b.due,
  };
});

/** Kit TRAIL / TRAIL_DEEP breadcrumb fixtures. */
export const SUBDECK_TRAIL: readonly BreadcrumbItem[] = [
  { label: 'Library', node: 'subdeck-list/crumb-library' },
  { label: 'Korean TOPIK I', current: true },
];
export const SUBDECK_TRAIL_DEEP: readonly BreadcrumbItem[] = [
  { label: 'Library', node: 'subdeck-list/crumb-library' },
  { label: 'Korean TOPIK I', node: 'subdeck-list/crumb-deck' },
  { label: 'Grammar', node: 'subdeck-list/crumb-grammar' },
  { label: 'Verbs', node: 'subdeck-list/crumb-verbs' },
  { label: 'Irregular verbs', current: true },
];

/** Compact deck aggregate for the SUBDECKS section label ("1,234 cards · 23 due"). */
export function subdeckSummary(list: readonly SubdeckView[]): string {
  const cards = list.reduce((n, s) => n + s.cards, 0);
  const due = list.reduce((n, s) => n + (s.due ?? 0), 0);
  return `${cards.toLocaleString('en-US')} cards · ${due} due`;
}

export type SubdeckListData =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly subdecks: readonly SubdeckView[]; readonly offline?: boolean };

export type SubdeckListUiState =
  | 'loaded'
  | 'dense'
  | 'deep'
  | 'empty'
  | 'search'
  | 'no-results'
  | 'selection'
  | 'create-sheet'
  | 'subdeck-actions'
  | 'play'
  | 'loading'
  | 'offline'
  | 'error';

export interface SubdeckListFixture {
  readonly data: SubdeckListData;
  readonly ui: SubdeckListUiState;
}

/** Fixtures keyed by canonical state name (contract §6 — 13 states). */
export const SUBDECK_LIST_FIXTURES: Record<SubdeckListUiState, SubdeckListFixture> = {
  loaded: { data: { status: 'ready', subdecks: SUBDECK_LIST }, ui: 'loaded' },
  dense: { data: { status: 'ready', subdecks: SUBDECK_DENSE }, ui: 'dense' },
  deep: { data: { status: 'ready', subdecks: SUBDECK_LIST }, ui: 'deep' },
  empty: { data: { status: 'ready', subdecks: [] }, ui: 'empty' },
  search: { data: { status: 'ready', subdecks: SUBDECK_LIST }, ui: 'search' },
  'no-results': { data: { status: 'ready', subdecks: SUBDECK_LIST }, ui: 'no-results' },
  selection: { data: { status: 'ready', subdecks: SUBDECK_LIST }, ui: 'selection' },
  'create-sheet': { data: { status: 'ready', subdecks: SUBDECK_LIST }, ui: 'create-sheet' },
  'subdeck-actions': { data: { status: 'ready', subdecks: SUBDECK_LIST }, ui: 'subdeck-actions' },
  play: { data: { status: 'ready', subdecks: SUBDECK_LIST }, ui: 'play' },
  loading: { data: { status: 'loading' }, ui: 'loading' },
  offline: { data: { status: 'ready', subdecks: SUBDECK_LIST, offline: true }, ui: 'offline' },
  error: { data: { status: 'error', message: 'Something went wrong. Check your connection and try again.' }, ui: 'error' },
};

export type SubdeckListFixtureKey = keyof typeof SUBDECK_LIST_FIXTURES;
