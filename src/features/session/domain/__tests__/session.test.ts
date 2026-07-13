/**
 * Unit tests for stage ordering + the session state machine (WBS 5.1).
 */

import { isOk, isErr } from '@/shared';
import {
  STAGE_ORDER,
  firstStage,
  nextStage,
  makeSession,
  sessionProgress,
  finalizeSession,
  stagesFor,
  type Session,
} from '@/features/session/domain';

describe('stage ordering (WBS 5.1)', () => {
  it('has the five stages in the canonical order', () => {
    expect(STAGE_ORDER).toEqual(['review', 'match', 'guess', 'recall', 'fill']);
    expect(firstStage()).toBe('review');
  });

  it('advances through stages and stops after the last', () => {
    expect(nextStage('review')).toBe('match');
    expect(nextStage('recall')).toBe('fill');
    expect(nextStage('fill')).toBeNull();
  });
});

describe('makeSession (WBS 5.1)', () => {
  it('requires at least one card', () => {
    const r = makeSession({ id: 's1', deckId: 'd1', mode: 'full', cardIds: [], startedAt: 0 });
    expect(isErr(r)).toBe(true);
  });

  it('starts active with the given cards', () => {
    const r = makeSession({ id: 's1', deckId: 'd1', mode: 'full', cardIds: ['a', 'b'], startedAt: 5 });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.status).toBe('active');
      expect(r.value.finalizedAt).toBeNull();
    }
  });
});

function session(mode: 'full' | 'review', cardIds: string[]): Session {
  return { id: 's1', deckId: 'd1', mode, cardIds, status: 'active', startedAt: 0, finalizedAt: null };
}

describe('sessionProgress state machine (WBS 5.1)', () => {
  it('a single-stage session covers each card once', () => {
    const s = session('review', ['a', 'b', 'c']);
    expect(stagesFor(s.mode)).toEqual(['review']);
    const p0 = sessionProgress(s, 0);
    expect(p0.total).toBe(3);
    expect(p0.position).toEqual({ stage: 'review', cardId: 'a', index: 0, total: 3 });
    expect(sessionProgress(s, 2).position?.cardId).toBe('c');
    expect(sessionProgress(s, 3).done).toBe(true);
  });

  it('a full session is stage-major: all cards per stage, then the next stage', () => {
    const s = session('full', ['a', 'b']);
    expect(sessionProgress(s, 0).position).toEqual({ stage: 'review', cardId: 'a', index: 0, total: 10 });
    expect(sessionProgress(s, 1).position?.cardId).toBe('b'); // still review
    expect(sessionProgress(s, 2).position?.stage).toBe('match'); // stage rolls over
    expect(sessionProgress(s, 9).position).toEqual({ stage: 'fill', cardId: 'b', index: 9, total: 10 });
    expect(sessionProgress(s, 10).done).toBe(true);
  });

  it('resume rebuilds the exact position from the persisted attempt count', () => {
    const s = session('full', ['a', 'b']);
    // 5 attempts recorded → index 5: stage floor(5/2)=2 (guess), card 5%2=1 (b)
    const resumed = sessionProgress(s, 5);
    expect(resumed.done).toBe(false);
    expect(resumed.completed).toBe(5);
    expect(resumed.position).toEqual({ stage: 'guess', cardId: 'b', index: 5, total: 10 });
  });

  it('clamps an over-count to done rather than reading past the end', () => {
    const s = session('review', ['a']);
    expect(sessionProgress(s, 99).done).toBe(true);
  });
});

describe('finalizeSession (WBS 5.1)', () => {
  it('marks the session finalized with a timestamp', () => {
    const s = finalizeSession(session('full', ['a']), 42);
    expect(s.status).toBe('finalized');
    expect(s.finalizedAt).toBe(42);
  });
});
