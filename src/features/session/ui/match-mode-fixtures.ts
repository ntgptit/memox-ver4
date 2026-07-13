/**
 * Match-mode (WBS 6.2) — preview fixtures for the six canonical states. Shared by the
 * screen tests and the visual golden. Board of five pairs; tones per the kit spec.
 */

import type { MatchPhase, MatchTileView, TileTone } from './match-mode-screen';

// meanings (left) ↔ terms (right); each pair shares a cardId (c1..c5).
const PAIRS = [
  { id: 'c1', meaning: 'time', term: '시간' },
  { id: 'c2', meaning: 'love', term: '사랑' },
  { id: 'c3', meaning: 'friend', term: '친구' },
  { id: 'c4', meaning: 'food', term: '음식' },
  { id: 'c5', meaning: 'school', term: '학교' },
];

function tiles(side: 'L' | 'R', tones: readonly TileTone[]): MatchTileView[] {
  const source = side === 'L' ? PAIRS : [...PAIRS].reverse();
  return source.map((p, i) => ({
    key: `${side}-${p.id}`,
    cardId: p.id,
    text: side === 'L' ? p.meaning : p.term,
    tone: tones[i] ?? 'neutral',
  }));
}

const N: TileTone[] = ['neutral', 'neutral', 'neutral', 'neutral', 'neutral'];

export interface MatchFixture {
  phase: MatchPhase;
  left: MatchTileView[];
  right: MatchTileView[];
  done: number;
  total: number;
}

export const MATCH_FIXTURES: Record<string, MatchFixture> = {
  playing: { phase: 'playing', left: tiles('L', N), right: tiles('R', N), done: 0, total: 5 },
  selected: {
    phase: 'playing',
    left: tiles('L', ['neutral', 'selected', 'neutral', 'neutral', 'neutral']),
    right: tiles('R', N),
    done: 0,
    total: 5,
  },
  correct: {
    // left 'love' (idx1) + right '사랑' (c2 → reversed idx3) both correct
    phase: 'playing',
    left: tiles('L', ['neutral', 'correct', 'neutral', 'neutral', 'neutral']),
    right: tiles('R', ['neutral', 'neutral', 'neutral', 'correct', 'neutral']),
    done: 1,
    total: 5,
  },
  wrong: {
    phase: 'playing',
    left: tiles('L', ['neutral', 'wrong', 'neutral', 'neutral', 'neutral']),
    right: tiles('R', ['neutral', 'wrong', 'neutral', 'neutral', 'neutral']),
    done: 0,
    total: 5,
  },
  almost: {
    // three pairs matched (dimmed), two remain
    phase: 'playing',
    left: tiles('L', ['matched', 'neutral', 'neutral', 'matched', 'matched']),
    right: tiles('R', ['matched', 'neutral', 'matched', 'matched', 'neutral']),
    done: 3,
    total: 5,
  },
  complete: { phase: 'complete', left: [], right: [], done: 5, total: 5 },
};

export type MatchFixtureKey = keyof typeof MATCH_FIXTURES;
