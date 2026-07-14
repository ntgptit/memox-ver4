/**
 * Player controller (WBS 7.3) — the hands-free loop with a scripted speaker:
 * load speaks the first card, done auto-advances, the last card ends the deck,
 * pause stops speech and play resumes, speed re-drives at the new rate,
 * a speech failure → error and retry recovers, replay restarts.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { FakeCardRepo, makeCard } from '@/shared/testing/session-fakes';

import { usePlayer, type PlayerDeps } from '../use-player';

const CARDS = [makeCard('c1', '학교', 'school'), makeCard('c2', '친구', 'friend')];

interface Spoken {
  term: string;
  rate: number;
  done: () => void;
  error: () => void;
}

function makeDeps(cards = CARDS): PlayerDeps & { spoken: Spoken[]; stops: number } {
  const spoken: Spoken[] = [];
  const box = { stops: 0 };
  const deps: PlayerDeps & { spoken: Spoken[]; stops: number } = {
    cards: new FakeCardRepo(cards),
    getDeckTitle: async () => 'TOPIK I — Vocabulary',
    speakCard: (term, _meaning, rate, onDone, onError) => {
      spoken.push({ term, rate, done: onDone, error: onError });
      return () => {
        box.stops += 1;
      };
    },
    spoken,
    get stops() {
      return box.stops;
    },
  };
  return deps;
}

describe('usePlayer — hands-free loop', () => {
  it('loads, titles the deck, and speaks the first card', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => usePlayer('d1', deps));
    await waitFor(() => expect(deps.spoken.map((s) => s.term)).toEqual(['학교']));
    expect(result.current.ui).toBe('playing');
    const d = result.current.data;
    if (d.status !== 'ready') throw new Error('unreachable');
    expect(d.deckTitle).toBe('TOPIK I — Vocabulary');
    expect(d.total).toBe(2);
  });

  it('speech done auto-advances; the last card ends the deck; replay restarts', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => usePlayer('d1', deps));
    await waitFor(() => expect(deps.spoken.length).toBe(1));
    act(() => deps.spoken[0].done());
    await waitFor(() => expect(deps.spoken.length).toBe(2));
    expect(deps.spoken[1].term).toBe('친구');
    act(() => deps.spoken[1].done());
    await waitFor(() => expect(result.current.ui).toBe('end'));

    act(() => result.current.replay());
    await waitFor(() => expect(deps.spoken.length).toBe(3));
    expect(deps.spoken[2].term).toBe('학교');
  });

  it('pause stops speech; play resumes speaking the current card', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => usePlayer('d1', deps));
    await waitFor(() => expect(deps.spoken.length).toBe(1));
    act(() => result.current.playPause());
    expect(result.current.ui).toBe('paused');
    expect(deps.stops).toBeGreaterThan(0);
    act(() => result.current.playPause());
    await waitFor(() => expect(deps.spoken.length).toBe(2));
    expect(result.current.ui).toBe('playing');
  });

  it('speed re-drives playback at the new rate', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => usePlayer('d1', deps));
    await waitFor(() => expect(deps.spoken.length).toBe(1));
    act(() => result.current.openSpeed());
    expect(result.current.ui).toBe('speed');
    act(() => result.current.setSpeed('1.5'));
    await waitFor(() => expect(deps.spoken.some((s) => s.rate === 1.5)).toBe(true));
    expect(result.current.speed).toBe('1.5');
  });

  it('a speech failure → error; retry reloads and plays again', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => usePlayer('d1', deps));
    await waitFor(() => expect(deps.spoken.length).toBe(1));
    act(() => deps.spoken[0].error());
    await waitFor(() => expect(result.current.ui).toBe('error'));
    act(() => result.current.retry());
    await waitFor(() => expect(deps.spoken.length).toBeGreaterThan(1));
    expect(result.current.ui).toBe('playing');
  });

  it('an empty deck goes straight to end', async () => {
    const deps = makeDeps([]);
    const { result } = renderHook(() => usePlayer('d1', deps));
    await waitFor(() => expect(result.current.ui).toBe('end'));
    expect(deps.spoken.length).toBe(0);
  });
});
