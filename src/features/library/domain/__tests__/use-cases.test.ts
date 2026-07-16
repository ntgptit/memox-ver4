/**
 * Unit tests for library use cases (WBS 3.1) over in-memory fake repositories.
 * Verifies typed results + the no-orphan / no-cycle invariants at the use-case level.
 */

import { ok, err, isOk, isErr, notFoundError } from '@/shared';
import type { Deck, Subdeck, DeckRepository, SubdeckRepository } from '@/features/library/domain';
import {
  createDeck,
  createSubdeck,
  moveSubdeckUseCase,
  renameDeckUseCase,
  renameSubdeckUseCase,
  setDeckContentUseCase,
} from '@/features/library/domain';

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

describe('duplicate deck titles (unique at the library root)', () => {
  const seed = (decks: FakeDeckRepo, id: string, title: string) =>
    decks.save({ id, title, languagePairId: 'lp1', organisation: 'cards', createdAt: 0, updatedAt: 0 });

  it('createDeck rejects a title an existing deck already uses (case/whitespace-insensitive)', async () => {
    const decks = new FakeDeckRepo();
    await seed(decks, 'd1', 'Korean TOPIK I');
    const r = await createDeck({ decks, ids: idSeq(), clock }).execute({
      title: '  korean topik i ',
      languagePairId: 'lp1',
      organisation: 'cards',
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) {
      expect(r.error.kind).toBe('validation');
      if (r.error.kind === 'validation') expect(r.error.issues[0]?.field).toBe('title');
    }
    expect(decks.decks.size).toBe(1);
  });

  it('renameDeckUseCase rejects another deck’s title but allows keeping your own', async () => {
    const decks = new FakeDeckRepo();
    await seed(decks, 'd1', 'Korean');
    await seed(decks, 'd2', 'Japanese');
    expect(isErr(await renameDeckUseCase({ decks, clock }).execute({ deckId: 'd2', title: 'Korean' }))).toBe(true);
    expect(isOk(await renameDeckUseCase({ decks, clock }).execute({ deckId: 'd2', title: 'Japanese' }))).toBe(true);
  });

  it('setDeckContentUseCase rejects another deck’s title but allows re-saving your own', async () => {
    const decks = new FakeDeckRepo();
    await seed(decks, 'd1', 'Korean');
    await seed(decks, 'd2', 'Japanese');
    const uc = setDeckContentUseCase({ decks, clock });
    expect(isErr(await uc.execute({ deckId: 'd2', title: 'Korean', organisation: 'cards' }))).toBe(true);
    expect(isOk(await uc.execute({ deckId: 'd2', title: 'Japanese', organisation: 'subdecks' }))).toBe(true);
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

describe('duplicate subdeck titles (unique among siblings)', () => {
  const seedDeck = (decks: FakeDeckRepo) =>
    decks.save({ id: 'd1', title: 'Spanish', languagePairId: 'lp1', organisation: 'subdecks', createdAt: 0, updatedAt: 0 });

  it('createSubdeck rejects a sibling’s title but allows the same title under another parent', async () => {
    const decks = new FakeDeckRepo();
    const subdecks = new FakeSubdeckRepo();
    await seedDeck(decks);
    await subdecks.save({ id: 's1', deckId: 'd1', parentId: null, title: 'Verbs', position: 0 });
    const uc = createSubdeck({ decks, subdecks, ids: idSeq() });
    const dup = await uc.execute({ deckId: 'd1', parentId: null, title: ' verbs ', position: 1 });
    expect(isErr(dup)).toBe(true);
    if (isErr(dup)) expect(dup.error.kind).toBe('validation');
    // Same title is fine one level down — it is not a sibling of s1.
    expect(isOk(await uc.execute({ deckId: 'd1', parentId: 's1', title: 'Verbs', position: 0 }))).toBe(true);
  });

  it('renameSubdeckUseCase rejects a sibling’s title but allows keeping your own', async () => {
    const subdecks = new FakeSubdeckRepo();
    await subdecks.save({ id: 's1', deckId: 'd1', parentId: null, title: 'Verbs', position: 0 });
    await subdecks.save({ id: 's2', deckId: 'd1', parentId: null, title: 'Nouns', position: 1 });
    expect(isErr(await renameSubdeckUseCase({ subdecks }).execute({ subdeckId: 's2', title: 'Verbs' }))).toBe(true);
    expect(isOk(await renameSubdeckUseCase({ subdecks }).execute({ subdeckId: 's2', title: 'Nouns' }))).toBe(true);
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

describe('renameSubdeckUseCase (WBS 12.11 B3)', () => {
  it('renames an existing subdeck', async () => {
    const subdecks = new FakeSubdeckRepo();
    await subdecks.save({ id: 's1', deckId: 'd1', parentId: null, title: 'Old', position: 0 });
    const r = await renameSubdeckUseCase({ subdecks }).execute({ subdeckId: 's1', title: 'New name' });
    expect(isOk(r)).toBe(true);
    expect(subdecks.subs.get('s1')?.title).toBe('New name');
  });

  it('rejects an empty title (entity validation) and a missing subdeck', async () => {
    const subdecks = new FakeSubdeckRepo();
    await subdecks.save({ id: 's1', deckId: 'd1', parentId: null, title: 'Old', position: 0 });
    expect(isErr(await renameSubdeckUseCase({ subdecks }).execute({ subdeckId: 's1', title: '  ' }))).toBe(true);
    expect(isErr(await renameSubdeckUseCase({ subdecks }).execute({ subdeckId: 'ghost', title: 'X' }))).toBe(true);
  });
});
