/**
 * Bulk import (WBS 9.1) — parser (separators, header skip, row-numbered
 * failures), duplicate counting, and the compensated bulk insert: progress
 * ticks, validation aborts before any write, and a mid-batch save failure
 * rolls back the cards already written.
 */

import { ok, err, isOk, isErr, notFoundError, storageError } from '@/shared';
import type { Card, CardRepository } from '@/features/flashcards/domain';
import {
  countDuplicateRows,
  importCards,
  makeCard,
  parseImportRows,
} from '@/features/flashcards/domain';

class FakeCardRepo implements CardRepository {
  cards = new Map<string, Card>();
  failOnSave: number | null = null;
  private saves = 0;
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
    this.saves += 1;
    if (this.failOnSave !== null && this.saves === this.failOnSave) {
      return err(storageError('disk full'));
    }
    this.cards.set(c.id, c);
    return ok(c);
  }
  async remove(id: string) {
    this.cards.delete(id);
    return ok(undefined);
  }
}

let seq = 0;
const ids = () => `id-${++seq}`;
const clock = () => 1752451200000;

function seedCard(repo: FakeCardRepo, term: string) {
  const built = makeCard({
    id: ids(),
    deckId: 'd1',
    subdeckId: null,
    term,
    meaning: 'x',
    tags: [],
    audioRef: null,
    createdAt: clock(),
  });
  if (isOk(built)) repo.cards.set(built.value.id, built.value);
}

describe('parseImportRows', () => {
  it('parses tab-separated lines and skips a literal header + blank lines', () => {
    const r = parseImportRows('Term\tMeaning\n안녕하세요\tHello\n\n감사합니다\tThank you\n', 'tab');
    expect(isOk(r) && r.value).toEqual([
      { term: '안녕하세요', meaning: 'Hello' },
      { term: '감사합니다', meaning: 'Thank you' },
    ]);
  });

  it('parses comma and semicolon separators, keeping extra separators in the meaning', () => {
    const comma = parseImportRows('사랑,love, affection', 'comma');
    expect(isOk(comma) && comma.value).toEqual([{ term: '사랑', meaning: 'love, affection' }]);
    const semi = parseImportRows('학교;school', 'semicolon');
    expect(isOk(semi) && semi.value).toEqual([{ term: '학교', meaning: 'school' }]);
  });

  it('fails with the 1-based row number of a malformed line', () => {
    const r = parseImportRows('a\tb\nbroken-line\nc\td', 'tab');
    expect(isErr(r)).toBe(true);
    if (isErr(r)) {
      expect(r.error.message).toBe('Couldn’t read the file at row 2. Check the format and try again.');
      expect(r.error.issues).toEqual([{ field: 'row', message: '2' }]);
    }
  });

  it('returns an empty list for empty text', () => {
    const r = parseImportRows('', 'tab');
    expect(isOk(r) && r.value).toEqual([]);
  });
});

describe('countDuplicateRows', () => {
  it('counts rows whose normalized term already exists in the deck', () => {
    const repo = new FakeCardRepo();
    seedCard(repo, '안녕하세요');
    seedCard(repo, 'hello  world');
    const existing = [...repo.cards.values()];
    const rows = [
      { term: ' 안녕하세요 ', meaning: 'Hello' }, // dup (trim)
      { term: 'HELLO WORLD', meaning: 'x' }, // dup (case + whitespace)
      { term: '학교', meaning: 'school' }, // fresh
    ];
    expect(countDuplicateRows(rows, existing)).toBe(2);
  });
});

describe('importCards', () => {
  it('saves every row and ticks progress per card', async () => {
    const repo = new FakeCardRepo();
    const ticks: [number, number][] = [];
    const r = await importCards({ cards: repo, ids, clock }).execute({
      deckId: 'd1',
      subdeckId: null,
      rows: [
        { term: '사랑', meaning: 'love' },
        { term: '학교', meaning: 'school' },
      ],
      onProgress: (done, total) => ticks.push([done, total]),
    });
    expect(isOk(r) && r.value).toEqual({ imported: 2 });
    expect(repo.cards.size).toBe(2);
    expect(ticks).toEqual([
      [1, 2],
      [2, 2],
    ]);
  });

  it('an invalid row aborts with its row number before any write', async () => {
    const repo = new FakeCardRepo();
    const r = await importCards({ cards: repo, ids, clock }).execute({
      deckId: 'd1',
      subdeckId: null,
      rows: [
        { term: '사랑', meaning: 'love' },
        { term: '', meaning: 'broken' },
      ],
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.message).toContain('row 2');
    expect(repo.cards.size).toBe(0);
  });

  it('a mid-batch save failure rolls back the already-saved cards', async () => {
    const repo = new FakeCardRepo();
    repo.failOnSave = 2;
    const r = await importCards({ cards: repo, ids, clock }).execute({
      deckId: 'd1',
      subdeckId: null,
      rows: [
        { term: '사랑', meaning: 'love' },
        { term: '학교', meaning: 'school' },
        { term: '친구', meaning: 'friend' },
      ],
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.kind).toBe('storage');
    expect(repo.cards.size).toBe(0);
  });
});
