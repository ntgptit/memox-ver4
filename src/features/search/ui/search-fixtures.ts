/**
 * Search (WBS 4.6) — view-model types + preview fixtures for the five canonical
 * states. Shared by the screen tests and the visual golden.
 */

import type { CardHit, CardStatus } from '@/features/search/data';

/** Result filter: all cards, or one study status. */
export type SearchFilter = 'all' | CardStatus;

/** What the body is showing right now. */
export type SearchPhase = 'recent' | 'loading' | 'results' | 'no-results';

export const SEARCH_FILTERS: { id: SearchFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'due', label: 'Due' },
  { id: 'mastered', label: 'Mastered' },
  { id: 'new', label: 'New' },
];

const SAMPLE_HITS: readonly CardHit[] = [
  { cardId: 'c1', term: '공부하다', meaning: 'to study', deckTitle: 'TOPIK I — Vocabulary', status: 'due' },
  { cardId: 'c2', term: '좋아하다', meaning: 'to like', deckTitle: 'Common Verbs', status: 'mastered' },
  { cardId: 'c3', term: '하다', meaning: 'to do (auxiliary)', deckTitle: 'TOPIK I — Vocabulary', status: 'new' },
];

const SAMPLE_RECENT: readonly string[] = ['안녕하세요', '학교', '감사합니다'];

export interface SearchView {
  query: string;
  phase: SearchPhase;
  hits: readonly CardHit[];
  recent: readonly string[];
  filter: SearchFilter;
}

export const SEARCH_FIXTURES: Record<string, SearchView> = {
  'empty-recent': { query: '', phase: 'recent', hits: [], recent: SAMPLE_RECENT, filter: 'all' },
  results: { query: '하', phase: 'results', hits: SAMPLE_HITS, recent: SAMPLE_RECENT, filter: 'all' },
  filtered: { query: '하', phase: 'results', hits: SAMPLE_HITS, recent: SAMPLE_RECENT, filter: 'due' },
  'no-results': { query: 'xyz', phase: 'no-results', hits: [], recent: SAMPLE_RECENT, filter: 'all' },
  loading: { query: '하', phase: 'loading', hits: [], recent: SAMPLE_RECENT, filter: 'all' },
};

export type SearchFixtureKey = keyof typeof SEARCH_FIXTURES;
