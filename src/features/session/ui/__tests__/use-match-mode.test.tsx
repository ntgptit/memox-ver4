/**
 * Match-mode controller (WBS 6.2) — session-play over in-memory fakes. Select then
 * match; correct locks + grades good, wrong clears; completing finalizes.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import { sequentialIds, fixedClock } from '@/shared/testing/fixtures';
import { FakeCardRepo, FakeSessionRepo, FakeAttemptRepo, FakeSrsRepo, makeCard } from '@/shared/testing/session-fakes';

import { useMatchMode, type MatchModeDeps } from '../use-match-mode';

function toneOf(tiles: readonly { cardId: string; tone: string }[], cardId: string) {
  return tiles.find((t) => t.cardId === cardId)?.tone;
}

function setup(cards = [makeCard('c1', '시간', 'time'), makeCard('c2', '사랑', 'love')]) {
  const _s = new FakeSessionRepo();
  const _a = new FakeAttemptRepo();
  const _srs = new FakeSrsRepo();
  const d: MatchModeDeps = {
    cards: new FakeCardRepo(cards),
    sessions: _s,
    attempts: _a,
    srs: _srs,
    ids: sequentialIds('x'),
    clock: fixedClock(1000),
  };
  return { d, _s, _a };
}

describe('useMatchMode', () => {
  it('loads a board and starts a session', async () => {
    const { d, _s } = setup();
    const { result } = renderHook(() => useMatchMode('d1', d));
    await waitFor(() => expect(result.current.total).toBe(2));
    expect(result.current.left).toHaveLength(2);
    expect(result.current.right).toHaveLength(2);
    await waitFor(() => expect(_s.saved).toHaveLength(1));
  });

  it('selecting a tile marks it selected', async () => {
    const { d } = setup();
    const { result } = renderHook(() => useMatchMode('d1', d));
    await waitFor(() => expect(result.current.total).toBe(2));
    act(() => result.current.onTap('L', 'c1'));
    expect(toneOf(result.current.left, 'c1')).toBe('selected');
  });

  it('a correct pair locks both tiles + persists a good attempt', async () => {
    const { d, _a } = setup();
    const { result } = renderHook(() => useMatchMode('d1', d));
    await waitFor(() => expect(_a).toBeDefined());
    await waitFor(() => expect(result.current.total).toBe(2));

    act(() => result.current.onTap('L', 'c1'));
    await act(async () => result.current.onTap('R', 'c1'));

    expect(toneOf(result.current.left, 'c1')).toBe('matched');
    expect(toneOf(result.current.right, 'c1')).toBe('matched');
    expect(result.current.done).toBe(1);
    expect(_a.saved[0]).toMatchObject({ cardId: 'c1', stage: 'match', result: 'good' });
  });

  it('a wrong pair clears the selection without matching', async () => {
    const { d, _a } = setup();
    const { result } = renderHook(() => useMatchMode('d1', d));
    await waitFor(() => expect(result.current.total).toBe(2));

    act(() => result.current.onTap('L', 'c1'));
    act(() => result.current.onTap('R', 'c2')); // mismatch
    expect(result.current.done).toBe(0);
    expect(toneOf(result.current.right, 'c2')).toBe('wrong');
    expect(_a.saved).toHaveLength(0);
  });

  it('matching every pair completes + finalizes', async () => {
    const { d, _s } = setup();
    const { result } = renderHook(() => useMatchMode('d1', d));
    await waitFor(() => expect(_s.saved).toHaveLength(1));

    act(() => result.current.onTap('L', 'c1'));
    await act(async () => result.current.onTap('R', 'c1'));
    act(() => result.current.onTap('L', 'c2'));
    await act(async () => result.current.onTap('R', 'c2'));

    expect(result.current.phase).toBe('complete');
    await waitFor(() => expect(_s.saved.some((s) => s.finalizedAt !== null)).toBe(true));
  });

  it('an empty deck completes immediately', async () => {
    const { d } = setup([]);
    const { result } = renderHook(() => useMatchMode('d1', d));
    await waitFor(() => expect(result.current.phase).toBe('complete'));
  });
});
