/**
 * Mode-picker controller (WBS 5.4) — counts each scope over in-memory fakes.
 * all = every card; srs = due cards; unlearned = cards with no SRS state.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import type { Card, CardRepository } from '@/features/flashcards/domain';
import type { SrsState, SrsStateRepository } from '@/features/session/domain';
import { ok, type Result, type AppError } from '@/shared';

import { useModePicker, type ModePickerDeps } from '../use-mode-picker';

function card(id: string): Card {
  return { id } as unknown as Card;
}
function srs(cardId: string): SrsState {
  return { cardId } as unknown as SrsState;
}

class FakeCardRepo implements CardRepository {
  constructor(private readonly cards: Card[]) {}
  subscribe() {
    return () => {};
  }
  async listByDeck(): Promise<Result<Card[], AppError>> {
    return ok(this.cards);
  }
  async countByDeck(): Promise<Result<number, AppError>> {
    return ok(this.cards.length);
  }
  async getById(): Promise<Result<Card, AppError>> {
    return ok(this.cards[0]);
  }
  async list(): Promise<Result<Card[], AppError>> {
    return ok(this.cards);
  }
  async save(e: Card): Promise<Result<Card, AppError>> {
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

class FakeSrsRepo implements SrsStateRepository {
  constructor(
    private readonly states: SrsState[],
    private readonly due: SrsState[],
  ) {}
  subscribe() {
    return () => {};
  }
  async dueCards(): Promise<Result<SrsState[], AppError>> {
    return ok(this.due);
  }
  async list(): Promise<Result<SrsState[], AppError>> {
    return ok(this.states);
  }
  async getById(): Promise<Result<SrsState, AppError>> {
    return ok(this.states[0]);
  }
  async save(e: SrsState): Promise<Result<SrsState, AppError>> {
    return ok(e);
  }
  async remove(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

function deps(): ModePickerDeps {
  // 5 cards; c1/c2 have SRS state (c1 due); c3/c4/c5 unlearned.
  const cards = ['c1', 'c2', 'c3', 'c4', 'c5'].map(card);
  const states = [srs('c1'), srs('c2')];
  const due = [srs('c1')];
  return { cards: new FakeCardRepo(cards), srs: new FakeSrsRepo(states, due), clock: () => 1000 };
}

describe('useModePicker', () => {
  it('null deps → counts null', () => {
    const { result } = renderHook(() => useModePicker('d1', null));
    expect(result.current.counts).toBeNull();
    expect(result.current.scopeCount).toBeNull();
  });

  it('computes all / srs / unlearned counts', async () => {
    const { result } = renderHook(() => useModePicker('d1', deps()));
    await waitFor(() => expect(result.current.counts).not.toBeNull());
    expect(result.current.counts).toEqual({ all: 5, srs: 1, unlearned: 3 });
  });

  it('scopeCount tracks the active scope', async () => {
    const { result } = renderHook(() => useModePicker('d1', deps()));
    await waitFor(() => expect(result.current.counts).not.toBeNull());
    expect(result.current.scopeCount).toBe(1); // default scope srs → 1 due
    act(() => result.current.setScope('all'));
    expect(result.current.scopeCount).toBe(5);
    act(() => result.current.setScope('unlearned'));
    expect(result.current.scopeCount).toBe(3);
  });
});
