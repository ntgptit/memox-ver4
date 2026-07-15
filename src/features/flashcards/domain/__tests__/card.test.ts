/**
 * Unit tests for the Card entity + duplicate detection (WBS 4.1).
 */

import { isOk, isErr } from '@/shared';
import { makeCard, editCard, normalizeTags, type Card } from '@/features/flashcards/domain';
import { normalizeTerm, findDuplicate } from '@/features/flashcards/domain';

function card(id: string, term: string): Card {
  return {
    id,
    deckId: 'd1',
    subdeckId: null,
    term,
    meaning: 'm',
    tags: [],
    audioRef: null, hidden: false,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('makeCard (WBS 4.1)', () => {
  it('constructs a valid card, trimming term/meaning', () => {
    const r = makeCard({
      id: 'c1',
      deckId: 'd1',
      subdeckId: null,
      term: '  hola ',
      meaning: ' hello ',
      tags: [],
      audioRef: null, hidden: false,
      createdAt: 5,
    });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.term).toBe('hola');
      expect(r.value.meaning).toBe('hello');
      expect(r.value.updatedAt).toBe(5);
    }
  });

  it('rejects an empty term or meaning', () => {
    const base = { id: 'c1', deckId: 'd1', subdeckId: null, tags: [], audioRef: null, hidden: false, createdAt: 0 };
    expect(isErr(makeCard({ ...base, term: '', meaning: 'x' }))).toBe(true);
    expect(isErr(makeCard({ ...base, term: 'x', meaning: '  ' }))).toBe(true);
  });

  it('requires an owning deck', () => {
    const r = makeCard({
      id: 'c1',
      deckId: '',
      subdeckId: null,
      term: 'x',
      meaning: 'y',
      tags: [],
      audioRef: null, hidden: false,
      createdAt: 0,
    });
    expect(isErr(r)).toBe(true);
  });
});

describe('normalizeTags (WBS 4.1)', () => {
  it('trims, drops empties, and de-duplicates case-insensitively (order preserved)', () => {
    expect(normalizeTags([' verb ', 'Verb', '', 'noun'])).toEqual(['verb', 'noun']);
  });
});

describe('editCard (WBS 4.1)', () => {
  it('re-validates and bumps updatedAt', () => {
    const c = card('c1', 'old');
    const r = editCard(c, { term: 'new', meaning: 'm2', tags: ['a'], audioRef: null }, 99);
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value.term).toBe('new');
      expect(r.value.updatedAt).toBe(99);
    }
  });

  it('rejects an invalid edit', () => {
    const c = card('c1', 'old');
    expect(isErr(editCard(c, { term: '', meaning: 'm', tags: [], audioRef: null }, 1))).toBe(true);
  });
});

describe('duplicate detection (WBS 4.1)', () => {
  it('normalizes term (trim, lowercase, collapse whitespace)', () => {
    expect(normalizeTerm('  Buenos   Días ')).toBe('buenos días');
  });

  it('finds a duplicate by normalized term', () => {
    const existing = [card('c1', 'Hola'), card('c2', 'Adiós')];
    expect(findDuplicate('  hola ', existing)?.id).toBe('c1');
  });

  it('ignores the card being edited via exceptId', () => {
    const existing = [card('c1', 'Hola')];
    expect(findDuplicate('hola', existing, 'c1')).toBeNull();
  });

  it('returns null when there is no match', () => {
    expect(findDuplicate('nuevo', [card('c1', 'Hola')])).toBeNull();
  });
});
