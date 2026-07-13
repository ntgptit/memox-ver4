/**
 * Unit tests for the SRS scheduler (WBS 5.1) — deterministic due/relearn logic.
 */

import {
  initialSrsState,
  schedule,
  isDue,
  DAY_MS,
  RELEARN_MS,
  type SrsState,
} from '@/features/session/domain';

const NOW = 1_000_000_000_000;

describe('initialSrsState (WBS 5.1)', () => {
  it('starts a new card due immediately with default ease', () => {
    const s = initialSrsState('c1', NOW);
    expect(s.stage).toBe('new');
    expect(s.dueAt).toBe(NOW);
    expect(s.ease).toBe(2.5);
    expect(isDue(s, NOW)).toBe(true);
  });
});

describe('schedule — graduating a new card (WBS 5.1)', () => {
  it('good on a new card schedules 1 day out and moves to review', () => {
    const next = schedule(initialSrsState('c1', NOW), 'good', NOW);
    expect(next.stage).toBe('review');
    expect(next.interval).toBe(1);
    expect(next.dueAt).toBe(NOW + DAY_MS);
    expect(next.reps).toBe(1);
  });

  it('easy on a new card schedules 4 days out', () => {
    const next = schedule(initialSrsState('c1', NOW), 'easy', NOW);
    expect(next.interval).toBe(4);
    expect(next.dueAt).toBe(NOW + 4 * DAY_MS);
  });
});

describe('schedule — reviewing (WBS 5.1)', () => {
  const reviewing: SrsState = {
    cardId: 'c1',
    dueAt: NOW,
    interval: 10,
    ease: 2.5,
    reps: 3,
    lapses: 0,
    stage: 'review',
  };

  it('good multiplies the interval by ease (deterministic)', () => {
    const next = schedule(reviewing, 'good', NOW);
    expect(next.interval).toBe(25); // round(10 * 2.5)
    expect(next.dueAt).toBe(NOW + 25 * DAY_MS);
  });

  it('hard grows the interval slowly and lowers ease', () => {
    const next = schedule(reviewing, 'hard', NOW);
    expect(next.interval).toBe(12); // round(10 * 1.2)
    expect(next.ease).toBeCloseTo(2.35, 5);
  });

  it('is deterministic — same inputs, same output', () => {
    expect(schedule(reviewing, 'good', NOW)).toEqual(schedule(reviewing, 'good', NOW));
  });
});

describe('schedule — again / relearning (WBS 5.1)', () => {
  const reviewing: SrsState = {
    cardId: 'c1',
    dueAt: NOW,
    interval: 20,
    ease: 2.5,
    reps: 5,
    lapses: 1,
    stage: 'review',
  };

  it('lapses the card into relearning with a short delay and one more lapse', () => {
    const next = schedule(reviewing, 'again', NOW);
    expect(next.stage).toBe('relearning');
    expect(next.lapses).toBe(2);
    expect(next.interval).toBe(0);
    expect(next.dueAt).toBe(NOW + RELEARN_MS);
    expect(next.ease).toBeCloseTo(2.3, 5); // -0.2
  });

  it('never lets ease fall below the floor (1.3)', () => {
    const low: SrsState = { ...reviewing, ease: 1.3 };
    expect(schedule(low, 'again', NOW).ease).toBe(1.3);
  });

  it('a good grade on a relearning card graduates it back to review', () => {
    const relearning: SrsState = { ...reviewing, stage: 'relearning', interval: 0 };
    const next = schedule(relearning, 'good', NOW);
    expect(next.stage).toBe('review');
    expect(next.interval).toBe(1);
  });
});
