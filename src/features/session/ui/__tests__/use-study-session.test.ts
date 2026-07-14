/**
 * Study-session orchestrator (WBS 5.5) — the full-flow lifecycle over the shared
 * session fakes: start persists a `full` session; stages advance review → match
 * → guess → recall → fill with per-answer persistence; wrong guesses re-queue as
 * not-counted relearn passes; resume rebuilds position from attempts; a failed
 * save parks behind the answer-save-error dialog and retry recovers; the last
 * stage finalizes; due mode reviews only due cards.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { ok, err, storageError } from '@/shared';
import { FakeCardRepo, FakeSessionRepo, FakeAttemptRepo, FakeSrsRepo, makeCard } from '@/shared/testing/session-fakes';

import { useStudySession, buildShellOptions, normalizeAnswer, type StudySessionDeps } from '../use-study-session';

const CARDS = [makeCard('c1', '학교', 'school'), makeCard('c2', '친구', 'friend')];

function makeDeps(cards = CARDS): StudySessionDeps & { fakes: { sessions: FakeSessionRepo; attempts: FakeAttemptRepo } } {
  const sessions = new FakeSessionRepo();
  const attempts = new FakeAttemptRepo();
  let n = 0;
  return {
    cards: new FakeCardRepo(cards),
    sessions,
    attempts,
    srs: new FakeSrsRepo(),
    ids: () => `id-${(n += 1)}`,
    clock: () => 1000 + n,
    fakes: { sessions, attempts },
  };
}

describe('pure helpers', () => {
  it('buildShellOptions rotates deterministically and contains the correct meaning', () => {
    const three = [...CARDS, makeCard('c3', '사랑', 'love')];
    const opts0 = buildShellOptions(three, 0);
    const opts1 = buildShellOptions(three, 1);
    expect(opts0).toContain('school');
    expect(opts1).toContain('friend');
    expect(opts0).not.toEqual(opts1);
  });

  it('normalizeAnswer trims and lowercases', () => {
    expect(normalizeAnswer('  School ')).toBe('school');
  });
});

describe('useStudySession — full 5-stage flow', () => {
  it('starts a full session on stage 1 with total = cards × 5', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useStudySession('d1', 'full', deps));
    await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
    expect(result.current.ui).toBe('stage1-review');
    expect(result.current.total).toBe(10);
    expect(result.current.done).toBe(0);
    expect(deps.fakes.sessions.saved[0]?.mode).toBe('full');
    expect(result.current.label).toBe('Stage 1 · Review');
  });

  it('review Next persists and advances; finishing the stage moves to match', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useStudySession('d1', 'full', deps));
    await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
    expect(result.current.ui).toBe('stage1-review');
    act(() => result.current.next());
    await waitFor(() => expect(result.current.done).toBe(1));
    act(() => result.current.next());
    await waitFor(() => expect(result.current.ui).toBe('stage2-match'));
    expect(deps.fakes.attempts.saved.map((a) => a.stage)).toEqual(['review', 'review']);
  });

  it('a wrong guess re-queues the card as a not-counted relearn pass', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useStudySession('d1', 'full', deps));
    await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
    expect(result.current.ui).toBe('stage1-review');
    // Fast-forward through review + match (Next persists 'good').
    for (let i = 0; i < 4; i += 1) {
      act(() => result.current.next());
      await waitFor(() => expect(result.current.done).toBe(i + 1));
    }
    await waitFor(() => expect(result.current.ui).toBe('stage3-guess'));

    // Wrong pick on c1 → grade 'again', queued for relearn.
    act(() => result.current.pickOption('WRONG'));
    await waitFor(() => expect(result.current.done).toBe(5));
    expect(deps.fakes.attempts.saved.at(-1)).toMatchObject({ cardId: 'c1', stage: 'guess', result: 'again' });

    // Correct pick on c2 → main pass done → the relearn tail begins.
    act(() => result.current.pickOption('friend'));
    await waitFor(() => expect(result.current.ui).toBe('relearn'));
    const doneBefore = result.current.done;
    act(() => result.current.pickOption('school'));
    await waitFor(() => expect(result.current.ui).toBe('stage4-recall'));
    expect(result.current.done).toBe(doneBefore); // relearn pass not counted
  });

  it('completing all five stages finalizes and reports done', async () => {
    const deps = makeDeps([makeCard('c1', '학교', 'school')]);
    const onDone = jest.fn();
    const { result } = renderHook(() => useStudySession('d1', 'full', deps, onDone));
    await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
    act(() => result.current.next()); // review
    await waitFor(() => expect(result.current.ui).toBe('stage2-match'));
    act(() => result.current.next()); // match (shell advance)
    await waitFor(() => expect(result.current.ui).toBe('stage3-guess'));
    act(() => result.current.pickOption('school'));
    await waitFor(() => expect(result.current.ui).toBe('stage4-recall'));
    act(() => result.current.reveal());
    await waitFor(() => expect(result.current.ui).toBe('stage5-fill'));
    act(() => result.current.setFillValue('학교'));
    act(() => result.current.check());
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(deps.fakes.sessions.saved.some((s) => s.status === 'finalized')).toBe(true);
    expect(deps.fakes.attempts.saved.length).toBe(5);
  });

  it('resume rebuilds position from persisted attempts', async () => {
    const deps = makeDeps();
    // Seed an active session with review fully answered.
    const first = renderHook(() => useStudySession('d1', 'full', deps));
    await waitFor(() => expect(first.result.current.total).toBeGreaterThan(0));
    act(() => first.result.current.next());
    await waitFor(() => expect(first.result.current.done).toBe(1));
    act(() => first.result.current.next());
    await waitFor(() => expect(first.result.current.ui).toBe('stage2-match'));
    first.unmount();

    // The fake always answers null; point resume at the seeded active session.
    const seeded = deps.fakes.sessions.saved.find((s) => s.status === 'active');
    deps.sessions.activeForDeck = async () => ok(seeded ?? null);
    const resumed = renderHook(() => useStudySession('d1', 'full', deps));
    await waitFor(() => expect(resumed.result.current.ui).toBe('stage2-match'));
    expect(resumed.result.current.done).toBe(2);
    expect(deps.fakes.sessions.saved.filter((s) => s.status === 'active').length).toBeGreaterThan(0);
  });

  it('exit dialog: close → exit, stay returns to the stage', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useStudySession('d1', 'full', deps));
    await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
    expect(result.current.ui).toBe('stage1-review');
    act(() => result.current.requestExit());
    expect(result.current.ui).toBe('exit');
    act(() => result.current.stay());
    expect(result.current.ui).toBe('stage1-review');
  });

  it('a failed answer save parks behind the dialog; retry recovers and advances', async () => {
    const deps = makeDeps();
    let fail = true;
    const realSave = deps.attempts.save.bind(deps.attempts);
    deps.attempts.save = async (a) => (fail ? err(storageError('disk full')) : realSave(a));

    const { result } = renderHook(() => useStudySession('d1', 'full', deps));
    await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
    expect(result.current.ui).toBe('stage1-review');
    act(() => result.current.next());
    await waitFor(() => expect(result.current.ui).toBe('answer-save-error'));

    fail = false;
    act(() => result.current.saveErrorRetry());
    await waitFor(() => expect(result.current.done).toBe(1));
    expect(result.current.ui).toBe('stage1-review'); // advanced to card 2, still review
  });
});

describe('useStudySession — due-review mode', () => {
  it('reviews only due cards; Next/Relearn grade good/again; completion finalizes', async () => {
    const deps = makeDeps();
    // c1 due, c2 not.
    deps.srs.dueCards = async () => ok([{ cardId: 'c1', dueAt: 0, interval: 0, ease: 2.5, reps: 1, lapses: 0, stage: 'review' }]);
    const onDone = jest.fn();
    const { result } = renderHook(() => useStudySession('d1', 'due', deps, onDone));
    await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
    expect(result.current.ui).toBe('due-review');
    expect(result.current.total).toBe(1);
    expect(result.current.label).toBe('Review · due cards');
    act(() => result.current.dueNext());
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(deps.fakes.attempts.saved[0]).toMatchObject({ cardId: 'c1', stage: 'review', result: 'good' });
  });
});
