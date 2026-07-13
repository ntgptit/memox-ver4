/**
 * Guess-mode (WBS 6.3) — preview fixtures for the five canonical states. Shared by the
 * screen tests and the visual golden.
 */

import type { GuessPhase } from './guess-mode-screen';

export interface GuessFixture {
  phase: GuessPhase;
  term: string;
  options: readonly string[];
  correctIndex: number;
  pickedIndex: number | null;
  done: number;
  total: number;
}

const CHOICES = ['school', 'hospital', 'park', 'restaurant', 'library'];
const LONG_CHOICES = [
  'a place where students go to study and learn from teachers',
  'a building where sick or injured people are cared for by doctors',
  'a public area with grass and trees, used for rest and recreation',
  'a business that cooks and serves food and drinks to customers',
  'a place where books are kept for reading, study, or borrowing',
];

const base = { term: '학교', options: CHOICES, correctIndex: 0, done: 8, total: 20 };

export const GUESS_FIXTURES: Record<string, GuessFixture> = {
  waiting: { ...base, phase: 'waiting', pickedIndex: null },
  correct: { ...base, phase: 'correct', pickedIndex: 0 },
  wrong: { ...base, phase: 'wrong', pickedIndex: 2 },
  'long-text': { ...base, phase: 'waiting', options: LONG_CHOICES, pickedIndex: null },
  complete: { phase: 'complete', term: '', options: [], correctIndex: 0, pickedIndex: null, done: 18, total: 20 },
};

export type GuessFixtureKey = keyof typeof GUESS_FIXTURES;
