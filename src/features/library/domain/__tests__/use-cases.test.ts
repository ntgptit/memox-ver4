/**
 * Unit tests for library use cases (WBS 3.1) over in-memory fake repositories.
 * Verifies typed results + the no-orphan / no-cycle invariants at the use-case level.
 */

import { ok, err, isOk, isErr, notFoundError } from '@/shared';
import type { Deck, Subdeck, DeckRepository, SubdeckRepository } from '@/features/library/domain';
import { createDeck, createSubdeck, moveSubdeckUseCase } from '@/features/library/domain';

class FakeDeckRepo implements DeckRepository {
  decks = new Map<string, Deck>();
  subscribe() {
    return () => {};
  }
  async getById(id: string) {
    const d = this.decks.get(id);
    return d ? ok(d) : err(notFoundError('Deck'));
  }
  async list() {
    return ok([...this.decks.values()]);
  }
  async save(d: Deck) {
    this.decks.set(d.id, d);
    return ok(d);
  }
  async remove(id: string) {
    this.decks.delete(id);
    return ok(undefined);
  }
}

class FakeSubdeckRepo implements SubdeckRepository {
  subs = new Map<string, Subdeck>();
  subscribe() {
    return () => {};
  }
  async getById(id: string) {
    const s = this.subs.get(id);
    return s ? ok(s) : err(notFoundError('Subdeck'));
  }
  async list() {
    return ok([...this.subs.values()]);
  }
  async listByDeck(deckId: string) {
    return ok([...this.subs.values()].filter((s) => s.deckId === deckId));
  }
  async save(s: Subdeck) {
    this.subs.set(s.id, s);
    return ok(s);
  }
  async remove(id: string) {
    this.subs.delete(id);
    return ok(undefined);
  }
}

const clock = () => 1_000;
function idSeq() {
  let n = 0;
  return () => `id${(n += 1)}`;
}

describe('createDeck (WBS 3.1)', () => {
  it('persists a valid deck', async () => {
    const decks = new FakeDeckRepo();
    const r = await createDeck({ decks, ids: idSeq(), clock }).execute({
      title: 'Spanish',
      languagePairId: 'lp1',
      organisation: 'subdecks',
    });
    expect(isOk(r)).toBe(true);
    expect(decks.decks.size).toBe(1);
  });

  it('rejects a blank title without writing', async () => {
    const decks = new FakeDeckRepo();
    const r = await createDeck({ decks, ids: idSeq(), clock }).execute({
      title: '   ',
      languagePairId: 'lp1',
      organisation: 'cards',
    });
    expect(isErr(r)).toBe(true);
    expect(decks.decks.size).toBe(0);
  });
});

describe('createSubdeck (WBS 3.1 no-orphan)', () => {
  it('refuses to create a subdeck under a non-existent deck', async () => {
    const decks = new FakeDeckRepo();
    const subdecks = new FakeSubdeckRepo();
    const r = await createSubdeck({ decks, subdecks, ids: idSeq() }).execute({
      deckId: 'ghost',
      parentId: null,
      title: 'Verbs',
      position: 0,
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('not-found');
    expect(subdecks.subs.size).toBe(0);
  });

  it('creates a subdeck when the deck exists', async () => {
    const decks = new FakeDeckRepo();
    const subdecks = new FakeSubdeckRepo();
    await decks.save({
      id: 'd1',
      title: 'Spanish',
      languagePairId: 'lp1',
      organisation: 'subdecks',
      createdAt: 0,
      updatedAt: 0,
    });
    const r = await createSubdeck({ decks, subdecks, ids: idSeq() }).execute({
      deckId: 'd1',
      parentId: null,
      title: 'Verbs',
      position: 0,
    });
    expect(isOk(r)).toBe(true);
    expect(subdecks.subs.size).toBe(1);
  });
});

describe('moveSubdeck (WBS 3.1 cycle guard)', () => {
  it('rejects moving a subdeck under its own descendant', async () => {
    const subdecks = new FakeSubdeckRepo();
    await subdecks.save({ id: 's1', deckId: 'd1', parentId: null, title: 'A', position: 0 });
    await subdecks.save({ id: 's2', deckId: 'd1', parentId: 's1', title: 'B', position: 0 });
    const r = await moveSubdeckUseCase({ subdecks }).execute({ subdeckId: 's1', newParentId: 's2' });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('conflict');
  });
});
