/**
 * Unit tests for flashcard use cases (WBS 4.1) over in-memory fake repositories.
 * Verifies duplicate rejection, validation short-circuit, edit, and add-translation.
 */

import { ok, err, isOk, isErr, notFoundError } from '@/shared';
import type {
  Card,
  CardTranslation,
  CardRepository,
  CardTranslationRepository,
} from '@/features/flashcards/domain';
import { createCard, editCardUseCase, addTranslation } from '@/features/flashcards/domain';

class FakeCardRepo implements CardRepository {
  cards = new Map<string, Card>();
  subscribe() {
    return () => {};
  }
  async getById(id: string) {
    const c = this.cards.get(id);
    return c ? ok(c) : err(notFoundError('Card'));
  }
  async list() {
    return ok([...this.cards.values()]);
  }
  async listByDeck(deckId: string) {
    return ok([...this.cards.values()].filter((c) => c.deckId === deckId));
  }
  async countByDeck(deckId: string) {
    return ok([...this.cards.values()].filter((c) => c.deckId === deckId).length);
  }
  async countByDecks(deckIds: readonly string[]) {
    return ok(new Map(deckIds.map((id) => [id, [...this.cards.values()].filter((c) => c.deckId === id).length])));
  }
  async save(c: Card) {
    this.cards.set(c.id, c);
    return ok(c);
  }
  async remove(id: string) {
    this.cards.delete(id);
    return ok(undefined);
  }
}

class FakeTranslationRepo implements CardTranslationRepository {
  items = new Map<string, CardTranslation>();
  subscribe() {
    return () => {};
  }
  async getById(id: string) {
    const t = this.items.get(id);
    return t ? ok(t) : err(notFoundError('CardTranslation'));
  }
  async list() {
    return ok([...this.items.values()]);
  }
  async listByCard(cardId: string) {
    return ok([...this.items.values()].filter((t) => t.cardId === cardId));
  }
  async save(t: CardTranslation) {
    this.items.set(t.id, t);
    return ok(t);
  }
  async remove(id: string) {
    this.items.delete(id);
    return ok(undefined);
  }
}

const clock = () => 100;
function idSeq(prefix = 'id') {
  let n = 0;
  return () => `${prefix}${(n += 1)}`;
}

function input(term: string) {
  return { deckId: 'd1', subdeckId: null, term, meaning: 'm', tags: [], audioRef: null };
}

describe('createCard (WBS 4.1)', () => {
  it('persists a valid card', async () => {
    const cards = new FakeCardRepo();
    const r = await createCard({ cards, ids: idSeq(), clock }).execute(input('hola'));
    expect(isOk(r)).toBe(true);
    expect(cards.cards.size).toBe(1);
  });

  it('rejects a duplicate term in the same deck without writing', async () => {
    const cards = new FakeCardRepo();
    const create = createCard({ cards, ids: idSeq(), clock });
    await create.execute(input('Hola'));
    const dup = await create.execute(input('  hola ')); // same after normalization
    expect(isErr(dup)).toBe(true);
    if (isErr(dup)) expect(dup.error.kind).toBe('conflict');
    expect(cards.cards.size).toBe(1);
  });

  it('short-circuits validation (empty term) before touching the repo', async () => {
    const cards = new FakeCardRepo();
    const r = await createCard({ cards, ids: idSeq(), clock }).execute(input('  '));
    expect(isErr(r)).toBe(true);
    expect(cards.cards.size).toBe(0);
  });
});

describe('editCardUseCase (WBS 4.1)', () => {
  it('rejects an edit whose new term collides with another card', async () => {
    const cards = new FakeCardRepo();
    const create = createCard({ cards, ids: idSeq(), clock });
    await create.execute(input('hola'));
    await create.execute(input('adios'));
    const [, second] = [...cards.cards.values()];
    const r = await editCardUseCase({ cards, clock }).execute({
      cardId: second.id,
      term: 'hola', // collides with the first card
      meaning: 'm',
      tags: [],
      audioRef: null,
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('conflict');
  });

  it('allows editing a card without changing its own term', async () => {
    const cards = new FakeCardRepo();
    await createCard({ cards, ids: idSeq(), clock }).execute(input('hola'));
    const [only] = [...cards.cards.values()];
    const r = await editCardUseCase({ cards, clock }).execute({
      cardId: only.id,
      term: 'hola',
      meaning: 'updated',
      tags: [],
      audioRef: null,
    });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.meaning).toBe('updated');
  });
});

describe('addTranslation (WBS 4.1)', () => {
  it('adds a translation to an existing card', async () => {
    const cards = new FakeCardRepo();
    const translations = new FakeTranslationRepo();
    await createCard({ cards, ids: idSeq('c'), clock }).execute(input('hola'));
    const [only] = [...cards.cards.values()];
    const r = await addTranslation({ cards, translations, ids: idSeq('t') }).execute({
      cardId: only.id,
      text: 'hi',
      position: 0,
    });
    expect(isOk(r)).toBe(true);
    expect(translations.items.size).toBe(1);
  });

  it('fails when the card does not exist', async () => {
    const cards = new FakeCardRepo();
    const translations = new FakeTranslationRepo();
    const r = await addTranslation({ cards, translations, ids: idSeq('t') }).execute({
      cardId: 'ghost',
      text: 'hi',
      position: 0,
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('not-found');
  });
});
