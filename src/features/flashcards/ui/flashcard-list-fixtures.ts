/**
 * Flashcard-list slice (WBS 4.3) — view model + state-matrix fixtures. Mirrors the
 * kit's `_features/flashcard-list/components/cardFixtures.jsx` VERBATIM. Domain:
 * Deck › Card (the deepest, final deck — no subdecks here).
 */

import type { BreadcrumbItem, StatusCardStatus } from '@/design-system';

export interface FlashcardView {
  readonly id: string;
  readonly term: string;
  readonly meaning: string;
  readonly status: StatusCardStatus;
  readonly hidden?: boolean;
}

/** Kit CARDS, verbatim (short + long meanings mixed on purpose). */
export const FLASHCARDS: readonly FlashcardView[] = [
  {
    id: 'c-hello',
    term: '안녕하세요',
    meaning:
      'Hello (formal). A polite everyday greeting used with strangers, elders, or in professional settings — literally “are you at peace?”',
    status: 'due',
  },
  { id: 'c-thanks', term: '감사합니다', meaning: 'Thank you (formal).', status: 'mastered' },
  {
    id: 'c-love',
    term: '사랑',
    meaning: 'love; affection — a deep feeling of care, attachment, or romantic devotion toward a person, place, or thing.',
    status: 'new',
  },
  { id: 'c-study', term: '공부하다', meaning: 'to study; to learn.', status: 'due' },
  { id: 'c-tasty', term: '맛있다', meaning: 'to be delicious; tasty (of food or drink).', status: 'mastered' },
  {
    id: 'c-hard',
    term: '어렵다',
    meaning: 'to be difficult or hard — not easy to do, understand, or endure.',
    status: 'new',
    hidden: true,
  },
];

/** A single short-meaning card (minimum data). */
export const FLASHCARDS_MIN: readonly FlashcardView[] = [FLASHCARDS[1]];

/** 16 rows cycling CARDS. */
export const FLASHCARDS_DENSE: readonly FlashcardView[] = Array.from({ length: 16 }, (_, i) => ({
  ...FLASHCARDS[i % FLASHCARDS.length],
  id: `${FLASHCARDS[i % FLASHCARDS.length].id}-${i}`,
}));

/** Long-text stress: an extreme term + the rest of CARDS. */
export const FLASHCARDS_LONG: readonly FlashcardView[] = [
  {
    id: 'c-long',
    term: '전화번호부에 등록되지 않은 사람',
    meaning:
      'a person who is not registered in the phone directory; someone whose contact details are unavailable — used when explaining why a call could not be completed',
    status: 'due',
  },
  ...FLASHCARDS.slice(1),
];

export const FLASHCARD_FILTERS = ['All', 'New', 'Due', 'Mastered'] as const;
export type FlashcardFilter = (typeof FLASHCARD_FILTERS)[number];

/** Kit TRAIL: this final deck is a subdeck of Korean TOPIK I. */
export const FLASHCARD_TRAIL: readonly BreadcrumbItem[] = [
  { label: 'Library', node: 'flashcard-list/crumb-library' },
  { label: 'Korean TOPIK I', node: 'flashcard-list/crumb-deck' },
  { label: 'Numbers & counting', current: true },
];

/** Compact study aggregate for the CARDS section label ("2 due · 2 mastered"). */
export function flashcardSummary(list: readonly FlashcardView[]): string {
  const due = list.filter((c) => c.status === 'due').length;
  const mastered = list.filter((c) => c.status === 'mastered').length;
  return `${due} due · ${mastered} mastered`;
}

export type FlashcardListData =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly cards: readonly FlashcardView[]; readonly offline?: boolean };

export type FlashcardListUiState =
  | 'loaded'
  | 'dense'
  | 'minimum-data'
  | 'long-text'
  | 'empty'
  | 'search'
  | 'no-results'
  | 'filter-applied'
  | 'selection'
  | 'add-sheet'
  | 'card-actions'
  | 'delete-confirm'
  | 'loading'
  | 'offline'
  | 'error';

export interface FlashcardListFixture {
  readonly data: FlashcardListData;
  readonly ui: FlashcardListUiState;
}

/** Fixtures keyed by canonical state name (contract §6 — 15 states). */
export const FLASHCARD_LIST_FIXTURES: Record<FlashcardListUiState, FlashcardListFixture> = {
  loaded: { data: { status: 'ready', cards: FLASHCARDS }, ui: 'loaded' },
  dense: { data: { status: 'ready', cards: FLASHCARDS_DENSE }, ui: 'dense' },
  'minimum-data': { data: { status: 'ready', cards: FLASHCARDS_MIN }, ui: 'minimum-data' },
  'long-text': { data: { status: 'ready', cards: FLASHCARDS_LONG }, ui: 'long-text' },
  empty: { data: { status: 'ready', cards: [] }, ui: 'empty' },
  search: { data: { status: 'ready', cards: FLASHCARDS }, ui: 'search' },
  'no-results': { data: { status: 'ready', cards: FLASHCARDS }, ui: 'no-results' },
  'filter-applied': { data: { status: 'ready', cards: FLASHCARDS }, ui: 'filter-applied' },
  selection: { data: { status: 'ready', cards: FLASHCARDS }, ui: 'selection' },
  'add-sheet': { data: { status: 'ready', cards: FLASHCARDS }, ui: 'add-sheet' },
  'card-actions': { data: { status: 'ready', cards: FLASHCARDS }, ui: 'card-actions' },
  'delete-confirm': { data: { status: 'ready', cards: FLASHCARDS }, ui: 'delete-confirm' },
  loading: { data: { status: 'loading' }, ui: 'loading' },
  offline: { data: { status: 'ready', cards: FLASHCARDS, offline: true }, ui: 'offline' },
  error: { data: { status: 'error', message: 'Something went wrong. Check your connection and try again.' }, ui: 'error' },
};

export type FlashcardListFixtureKey = keyof typeof FLASHCARD_LIST_FIXTURES;
