/**
 * Deck export (WBS 9.2) — serializer (header, separators, SRS columns, field
 * sanitizing), the import round-trip guarantee, and the exportDeck use case
 * (scope filter, SRS join, progress).
 */

import { ok, err, isOk, isErr, notFoundError, type Result } from '@/shared';
import type { Card, CardRepository } from '@/features/flashcards/domain';
import {
  exportDeck,
  makeCard,
  parseImportRows,
  serializeExport,
} from '@/features/flashcards/domain';

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
  async listByDeck(deckId: string): Promise<Result<Card[]>> {
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

let seq = 0;
function card(term: string, meaning: string, subdeckId: string | null = null): Card {
  const built = makeCard({
    id: `id-${++seq}`,
    deckId: 'd1',
    subdeckId,
    term,
    meaning,
    tags: [],
    audioRef: null,
    createdAt: 1752451200000,
  });
  if (!isOk(built)) throw new Error('fixture card invalid');
  return built.value;
}

describe('serializeExport', () => {
  it('writes a header + one line per card with the chosen separator', () => {
    const text = serializeExport([card('사랑', 'love'), card('학교', 'school')], {
      separator: 'comma',
      includeSrs: false,
    });
    expect(text).toBe('Term,Meaning\n사랑,love\n학교,school');
  });

  it('appends Box/Due columns when review state is included', () => {
    const c = card('사랑', 'love');
    const text = serializeExport([c, card('학교', 'school')], {
      separator: 'tab',
      includeSrs: true,
      srsByCard: new Map([[c.id, { box: 3, dueAt: Date.UTC(2026, 6, 20) }]]),
    });
    expect(text.split('\n')[0]).toBe('Term\tMeaning\tBox\tDue');
    expect(text.split('\n')[1]).toBe('사랑\tlove\t3\t2026-07-20');
    expect(text.split('\n')[2]).toBe('학교\tschool\t\t');
  });

  it('sanitizes newlines and separator characters in the term', () => {
    const text = serializeExport([card('hello\tworld', 'line1\nline2')], {
      separator: 'tab',
      includeSrs: false,
    });
    expect(text.split('\n')[1]).toBe('hello world\tline1 line2');
  });

  it('round-trips through the 9.1 importer', () => {
    const cards = [card('사랑', 'love'), card('학교', 'school, university')];
    const text = serializeExport(cards, { separator: 'comma', includeSrs: false });
    const back = parseImportRows(text, 'comma');
    expect(isOk(back) && back.value).toEqual([
      { term: '사랑', meaning: 'love' },
      { term: '학교', meaning: 'school, university' },
    ]);
  });
});

describe('exportDeck', () => {
  function seed(repo: FakeCardRepo) {
    const root = card('사랑', 'love');
    const sub = card('학교', 'school', 'sd1');
    repo.cards.set(root.id, root);
    repo.cards.set(sub.id, sub);
    return { root, sub };
  }

  it("scope 'deck' exports root cards only; 'subtree' includes sub-decks", async () => {
    const repo = new FakeCardRepo();
    seed(repo);
    const uc = exportDeck({ cards: repo, srsFor: async () => null });

    const deckOnly = await uc.execute({ deckId: 'd1', scope: 'deck', separator: 'tab', includeSrs: false });
    expect(isOk(deckOnly) && deckOnly.value.count).toBe(1);

    const subtree = await uc.execute({ deckId: 'd1', scope: 'subtree', separator: 'tab', includeSrs: false });
    expect(isOk(subtree) && subtree.value.count).toBe(2);
    if (isOk(subtree)) expect(subtree.value.text).toContain('학교\tschool');
  });

  it('joins per-card review state and ticks progress', async () => {
    const repo = new FakeCardRepo();
    const { root } = seed(repo);
    const ticks: [number, number][] = [];
    const uc = exportDeck({
      cards: repo,
      srsFor: async (cardId) => (cardId === root.id ? { box: 2, dueAt: Date.UTC(2026, 6, 21) } : null),
    });
    const r = await uc.execute({
      deckId: 'd1',
      scope: 'subtree',
      separator: 'tab',
      includeSrs: true,
      onProgress: (done, total) => ticks.push([done, total]),
    });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.text).toContain('사랑\tlove\t2\t2026-07-21');
      expect(r.value.text).toContain('학교\tschool\t\t');
    }
    expect(ticks).toEqual([
      [1, 2],
      [2, 2],
    ]);
  });

  it('propagates a failing card read', async () => {
    const repo = new FakeCardRepo();
    repo.listByDeck = async () => err(notFoundError('Deck'));
    const uc = exportDeck({ cards: repo, srsFor: async () => null });
    const r = await uc.execute({ deckId: 'd1', scope: 'deck', separator: 'tab', includeSrs: false });
    expect(isErr(r)).toBe(true);
  });
});
