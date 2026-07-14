/**
 * Review-mode controller (WBS 6.1) — the browse-round lifecycle over the shared
 * session fakes: start persists a `review` session, next records ONE attempt per
 * card (grade `good`), prev never re-records, edit persists through the card
 * repo, audio speaks the term, and passing the last card finalizes + ends.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { FakeCardRepo, FakeSessionRepo, FakeAttemptRepo, FakeSrsRepo, makeCard } from '@/shared/testing/session-fakes';

import { useReviewMode, type ReviewModeDeps } from '../use-review-mode';

function makeDeps(cards = [makeCard('c1', '학교', 'school'), makeCard('c2', '친구', 'friend')]): ReviewModeDeps & {
  fakes: { sessions: FakeSessionRepo; attempts: FakeAttemptRepo; spoken: string[] };
} {
  const sessions = new FakeSessionRepo();
  const attempts = new FakeAttemptRepo();
  const spoken: string[] = [];
  let n = 0;
  return {
    cards: new FakeCardRepo(cards),
    sessions,
    attempts,
    srs: new FakeSrsRepo(),
    ids: () => `id-${(n += 1)}`,
    clock: () => 1000 + n,
    speak: (term) => spoken.push(term),
    fakes: { sessions, attempts, spoken },
  };
}

describe('useReviewMode — browse round', () => {
  it('starts a review session and browses the first card', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useReviewMode('d1', deps));
    await waitFor(() => expect(result.current.ui).toBe('browsing'));
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.term).toBe('학교');
    expect(d.total).toBe(2);
    expect(d.done).toBe(0);
    expect(deps.fakes.sessions.saved[0]?.mode).toBe('review');
  });

  it('next records one attempt per card; prev never re-records', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useReviewMode('d1', deps));
    await waitFor(() => expect(result.current.ui).toBe('browsing'));

    act(() => result.current.next());
    await waitFor(() => expect(deps.fakes.attempts.saved.length).toBe(1));
    expect(deps.fakes.attempts.saved[0]).toMatchObject({ cardId: 'c1', stage: 'review', result: 'good' });

    act(() => result.current.prev());
    act(() => result.current.next());
    await waitFor(() => {
      const d = result.current.data;
      if (d.status !== 'ready') throw new Error('not ready');
      expect(d.term).toBe('친구');
    });
    expect(deps.fakes.attempts.saved.length).toBe(1); // c1 recorded once
  });

  it('passing the last card records it, finalizes and ends the round', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useReviewMode('d1', deps));
    await waitFor(() => expect(result.current.ui).toBe('browsing'));
    act(() => result.current.next());
    act(() => result.current.next());
    await waitFor(() => expect(result.current.ui).toBe('end'));
    expect(deps.fakes.attempts.saved.map((a) => a.cardId)).toEqual(['c1', 'c2']);
    await waitFor(() => expect(deps.fakes.sessions.saved.some((s) => s.status === 'finalized')).toBe(true));
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.done).toBe(2);
  });

  it('edit lifecycle persists the new meaning and returns to browsing', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useReviewMode('d1', deps));
    await waitFor(() => expect(result.current.ui).toBe('browsing'));
    act(() => result.current.editStart());
    expect(result.current.ui).toBe('editing');
    act(() => result.current.editSave('school; academy'));
    await waitFor(() => expect(result.current.ui).toBe('browsing'));
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.meaning).toBe('school; academy');
  });

  it('audio speaks the current term and enters the audio state', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useReviewMode('d1', deps));
    await waitFor(() => expect(result.current.ui).toBe('browsing'));
    act(() => result.current.playAudio());
    expect(deps.fakes.spoken).toEqual(['학교']);
    expect(result.current.ui).toBe('audio');
  });

  it('an empty deck goes straight to end', async () => {
    const deps = makeDeps([]);
    const { result } = renderHook(() => useReviewMode('d1', deps));
    await waitFor(() => expect(result.current.ui).toBe('end'));
  });
});
