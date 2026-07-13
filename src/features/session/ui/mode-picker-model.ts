/**
 * Mode-picker (WBS 5.4) — pure catalog + view model. The five study modes map 1:1 to
 * the session stages (5.1); the scope decides which of a deck's cards feed the round.
 * No UI/DB imports — the screen and tests share these.
 */

import type { SessionStage } from '@/features/session/domain';

/** Which cards a session draws from. */
export type StudyScope = 'srs' | 'all' | 'unlearned';

export interface ModeChoice {
  readonly id: SessionStage;
  readonly icon: string;
  readonly name: string;
  readonly desc: string;
}

export interface ScopeChoice {
  readonly id: StudyScope;
  readonly icon: string;
  readonly label: string;
}

/** The five modes, in stage order (review → match → guess → recall → fill). */
export const MODE_CHOICES: readonly ModeChoice[] = [
  { id: 'review', icon: 'style', name: 'Review', desc: 'Browse and flip cards' },
  { id: 'match', icon: 'join_inner', name: 'Match', desc: 'Match terms to meanings' },
  { id: 'guess', icon: 'quiz', name: 'Guess', desc: 'Pick the right meaning' },
  { id: 'recall', icon: 'psychology', name: 'Recall', desc: 'Recall, then self-grade' },
  { id: 'fill', icon: 'keyboard', name: 'Fill', desc: 'Type the term from its meaning' },
];

/** The three card sources offered by the scope sheet. */
export const SCOPE_CHOICES: readonly ScopeChoice[] = [
  { id: 'srs', icon: 'schedule', label: 'By schedule' },
  { id: 'all', icon: 'apps', label: 'All cards' },
  { id: 'unlearned', icon: 'hourglass_empty', label: 'Unlearned only' },
];

/** Minimum words needed to start a round (drives the not-enough guard). */
export const MIN_WORDS = 4;

/** Words per round (footer copy). */
export const WORDS_PER_ROUND = 5;

export function scopeLabel(scope: StudyScope): string {
  return SCOPE_CHOICES.find((s) => s.id === scope)?.label ?? 'By schedule';
}
