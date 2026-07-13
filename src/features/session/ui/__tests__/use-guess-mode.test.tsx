/**
 * Guess-mode controller (WBS 6.3) — session-play over in-memory fakes. Loads options,
 * persists each pick (correct→good / wrong→again), steps on continue, and finalizes.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import { sequentialIds, fixedClock } from '@/shared/testing/fixtures';
import { FakeCardRepo, FakeSessionRepo, FakeAttemptRepo, FakeSrsRepo, makeCard } from '@/shared/testing/session-fakes';

import { useGuessMode, type GuessModeDeps } from '../use-guess-mode';

function deps(cards = [makeCard('c1', '학교', 'school'), makeCard('c2', '병원', 'hospital')]) {
  const _s = new FakeSessionRepo();
  const _a = new FakeAttemptRepo();
  const _srs = new FakeSrsRepo();
  const d: GuessModeDeps = {
    cards: new FakeCardRepo(cards),
    sessions: _s,
    attempts: _a,
    srs: _srs,
    ids: sequentialIds('x'),
    clock: fixedClock(1000),
  };
  return { d, _s, _a, _srs };
}

describe('useGuessMode', () => {
  it('loads the first card + options and starts a session', async () => {
    const { d, _s } = deps();
    const { result } = renderHook(() => useGuessMode('d1', d));
    await waitFor(() => expect(result.current.term).toBe('학교'));
    expect(result.current.options).toContain('school');
    expect(result.current.options[result.current.correctIndex]).toBe('school');
    expect(result.current.total).toBe(2);
    await waitFor(() => expect(_s.saved).toHaveLength(1));
  });

  it('a correct pick scores it and persists a good attempt', async () => {
    const { d, _a, _srs } = deps();
    const { result } = renderHook(() => useGuessMode('d1', d));
    await waitFor(() => expect(result.current.term).toBe('학교'));
    await waitFor(() => expect(result.current.options.length).toBeGreaterThan(0));

    await act(async () => result.current.pick(result.current.correctIndex));
    expect(result.current.phase).toBe('correct');
    expect(result.current.done).toBe(1);
    expect(_a.saved[0]).toMatchObject({ cardId: 'c1', stage: 'guess', result: 'good' });
    expect(_srs.saved.has('c1')).toBe(true);
  });

  it('a wrong pick persists an again attempt and does not score', async () => {
    const { d, _a } = deps();
    const { result } = renderHook(() => useGuessMode('d1', d));
    await waitFor(() => expect(result.current.term).toBe('학교'));

    const wrong = (result.current.correctIndex + 1) % result.current.options.length;
    await act(async () => result.current.pick(wrong));
    expect(result.current.phase).toBe('wrong');
    expect(result.current.done).toBe(0);
    expect(_a.saved[0]).toMatchObject({ cardId: 'c1', result: 'again' });
  });

  it('continue advances to the next card', async () => {
    const { d } = deps();
    const { result } = renderHook(() => useGuessMode('d1', d));
    await waitFor(() => expect(result.current.term).toBe('학교'));
    await act(async () => result.current.pick(result.current.correctIndex));
    act(() => result.current.advance());
    expect(result.current.phase).toBe('waiting');
    expect(result.current.term).toBe('병원');
  });

  it('finishing the deck completes + finalizes the session', async () => {
    const { d, _s } = deps();
    const { result } = renderHook(() => useGuessMode('d1', d));
    await waitFor(() => expect(_s.saved).toHaveLength(1));

    await act(async () => result.current.pick(result.current.correctIndex));
    act(() => result.current.advance());
    await act(async () => result.current.pick(result.current.correctIndex));
    act(() => result.current.advance());

    expect(result.current.phase).toBe('complete');
    await waitFor(() => expect(_s.saved.some((s) => s.finalizedAt !== null)).toBe(true));
  });

  it('an empty deck completes immediately', async () => {
    const { d } = deps([]);
    const { result } = renderHook(() => useGuessMode('d1', d));
    await waitFor(() => expect(result.current.phase).toBe('complete'));
  });
});
