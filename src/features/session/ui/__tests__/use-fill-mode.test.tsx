/**
 * Fill-mode controller (WBS 7.2) — session-play over in-memory fakes. Type → check
 * (correct→good / wrong→again), hint, retry, accept-as-correct, and finalize.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import { sequentialIds, fixedClock } from '@/shared/testing/fixtures';
import { FakeCardRepo, FakeSessionRepo, FakeAttemptRepo, FakeSrsRepo, makeCard } from '@/shared/testing/session-fakes';

import { useFillMode, type FillModeDeps } from '../use-fill-mode';

function setup(cards = [makeCard('c1', '친구', 'friend')]) {
  const _s = new FakeSessionRepo();
  const _a = new FakeAttemptRepo();
  const _srs = new FakeSrsRepo();
  const d: FillModeDeps = {
    cards: new FakeCardRepo(cards),
    sessions: _s,
    attempts: _a,
    srs: _srs,
    ids: sequentialIds('x'),
    clock: fixedClock(1000),
  };
  return { d, _s, _a, _srs };
}

describe('useFillMode', () => {
  it('loads the meaning and starts waiting', async () => {
    const { d, _s } = setup();
    const { result } = renderHook(() => useFillMode('d1', d));
    await waitFor(() => expect(result.current.meaning).toBe('friend'));
    expect(result.current.phase).toBe('waiting');
    await waitFor(() => expect(_s.saved).toHaveLength(1));
  });

  it('typing moves to typing; a correct check grades good', async () => {
    const { d, _a } = setup();
    const { result } = renderHook(() => useFillMode('d1', d));
    await waitFor(() => expect(_a).toBeDefined());
    await waitFor(() => expect(result.current.meaning).toBe('friend'));

    act(() => result.current.onChangeInput('친구'));
    expect(result.current.phase).toBe('typing');
    await act(async () => result.current.onCheck());

    expect(result.current.phase).toBe('correct');
    expect(_a.saved[0]).toMatchObject({ cardId: 'c1', stage: 'fill', result: 'good' });
  });

  it('a wrong check grades again and offers the answer', async () => {
    const { d, _a } = setup();
    const { result } = renderHook(() => useFillMode('d1', d));
    await waitFor(() => expect(result.current.meaning).toBe('friend'));

    act(() => result.current.onChangeInput('친고'));
    await act(async () => result.current.onCheck());
    expect(result.current.phase).toBe('wrong');
    expect(result.current.term).toBe('친구');
    expect(_a.saved[0]).toMatchObject({ result: 'again' });
  });

  it('help reveals a hint', async () => {
    const { d } = setup();
    const { result } = renderHook(() => useFillMode('d1', d));
    await waitFor(() => expect(result.current.meaning).toBe('friend'));
    act(() => result.current.onHint());
    expect(result.current.phase).toBe('hint');
    expect(result.current.hint).toBe('Hint: 2 characters, starts with 친');
  });

  it('retry returns to the input; accept records good + advances', async () => {
    const { d, _a } = setup([makeCard('c1', '친구', 'friend'), makeCard('c2', '학교', 'school')]);
    const { result } = renderHook(() => useFillMode('d1', d));
    await waitFor(() => expect(result.current.meaning).toBe('friend'));

    act(() => result.current.onChangeInput('x'));
    await act(async () => result.current.onCheck()); // wrong
    act(() => result.current.onRetry());
    expect(result.current.phase).toBe('waiting');
    expect(result.current.input).toBe('');

    act(() => result.current.onChangeInput('y'));
    await act(async () => result.current.onCheck()); // wrong again
    await act(async () => result.current.onAccept()); // "I was right" → good + advance
    expect(_a.saved.some((a) => a.result === 'good')).toBe(true);
    expect(result.current.meaning).toBe('school'); // advanced
  });

  it('completing the deck finalizes the session', async () => {
    const { d, _s } = setup();
    const { result } = renderHook(() => useFillMode('d1', d));
    await waitFor(() => expect(_s.saved).toHaveLength(1));

    act(() => result.current.onChangeInput('친구'));
    await act(async () => result.current.onCheck());
    act(() => result.current.onNext());
    expect(result.current.phase).toBe('complete');
    await waitFor(() => expect(_s.saved.some((s) => s.finalizedAt !== null)).toBe(true));
  });

  it('an empty deck completes immediately', async () => {
    const { d } = setup([]);
    const { result } = renderHook(() => useFillMode('d1', d));
    await waitFor(() => expect(result.current.phase).toBe('complete'));
  });
});
