/**
 * Fill-mode (WBS 7.2) — preview fixtures for the six canonical states. Shared by the
 * screen tests and the visual golden.
 */

import type { FillPhase } from './fill-mode-screen';

export interface FillFixture {
  phase: FillPhase;
  meaning: string;
  term: string;
  input: string;
  hint?: string;
  done: number;
  total: number;
}

const base = { meaning: 'friend', term: '친구', done: 16, total: 20 };

export const FILL_FIXTURES: Record<string, FillFixture> = {
  waiting: { ...base, phase: 'waiting', input: '' },
  typing: { ...base, phase: 'typing', input: '친' },
  hint: { ...base, phase: 'hint', input: '친', hint: 'Hint: 2 characters, starts with 친' },
  correct: { ...base, phase: 'correct', input: '친구' },
  wrong: { ...base, phase: 'wrong', input: '친고' },
  complete: { phase: 'complete', meaning: '', term: '', input: '', done: 20, total: 20 },
};

export type FillFixtureKey = keyof typeof FILL_FIXTURES;
