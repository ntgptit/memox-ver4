/**
 * Deck-settings (WBS 4.5) — preview fixtures for the five overlay states. Shared by
 * the screen tests and the visual golden.
 */

import type { DeckSettingsOverlay, LanguagePairOption } from './deck-settings-screen';

export const DECK_SETTINGS_PAIRS: readonly LanguagePairOption[] = [
  { id: 'lp-ko-en', label: 'Korean → English' },
  { id: 'lp-ja-en', label: 'Japanese → English' },
  { id: 'lp-zh-en', label: 'Chinese → English' },
];

export const DECK_SETTINGS_FIXTURE = {
  deckTitle: 'Korean TOPIK I',
  languagePairs: DECK_SETTINGS_PAIRS,
  currentPairId: 'lp-ko-en',
};

/** Overlay keyed by the canonical state name (contract §6). */
export const DECK_SETTINGS_OVERLAYS: Record<string, DeckSettingsOverlay> = {
  'action-sheet': 'actions',
  rename: 'rename',
  move: 'move',
  'reset-confirm': 'reset',
  'delete-confirm': 'delete',
};

export type DeckSettingsFixtureKey = keyof typeof DECK_SETTINGS_OVERLAYS;
