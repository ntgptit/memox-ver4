/**
 * Unit tests for the session row ↔ entity mappers (WBS 5.2). Pure, no DB.
 */

import { rowToSession, rowToAttempt, rowToSrsState, serializeCardIds } from '@/features/session/data';

describe('session mappers (WBS 5.2)', () => {
  it('parses card_ids JSON and maps a session row', () => {
    const s = rowToSession({
      id: 's1',
      deck_id: 'd1',
      mode: 'full',
      card_ids: '["c1","c2"]',
      status: 'active',
      started_at: 5,
      finalized_at: null,
    });
    expect(s.cardIds).toEqual(['c1', 'c2']);
    expect(s.finalizedAt).toBeNull();
  });

  it('degrades malformed card_ids to an empty array', () => {
    const s = rowToSession({
      id: 's1',
      deck_id: 'd1',
      mode: 'review',
      card_ids: 'nope',
      status: 'finalized',
      started_at: 0,
      finalized_at: 9,
    });
    expect(s.cardIds).toEqual([]);
    expect(s.finalizedAt).toBe(9);
  });

  it('serializeCardIds round-trips', () => {
    expect(serializeCardIds(['a', 'b'])).toBe('["a","b"]');
  });

  it('maps an attempt row', () => {
    expect(
      rowToAttempt({ id: 'a1', session_id: 's1', card_id: 'c1', stage: 'guess', result: 'hard', answered_at: 10 }),
    ).toEqual({ id: 'a1', sessionId: 's1', cardId: 'c1', stage: 'guess', result: 'hard', answeredAt: 10 });
  });

  it('maps an srs_state row', () => {
    expect(
      rowToSrsState({ card_id: 'c1', due_at: 100, interval: 5, ease: 2.4, reps: 3, lapses: 1, stage: 'review' }),
    ).toEqual({ cardId: 'c1', dueAt: 100, interval: 5, ease: 2.4, reps: 3, lapses: 1, stage: 'review' });
  });
});
