/**
 * Unit tests for the row ↔ entity mappers (WBS 3.2). Pure, no DB.
 */

import { rowToDeck, rowToSubdeck, rowToLanguagePair } from '@/features/library/data';

describe('mappers (WBS 3.2)', () => {
  it('maps a deck row to the domain entity (snake → camel)', () => {
    const deck = rowToDeck({
      id: 'd1',
      title: 'Spanish',
      language_pair_id: 'lp1',
      organisation: 'cards',
      created_at: 10,
      updated_at: 20,
    });
    expect(deck).toEqual({
      id: 'd1',
      title: 'Spanish',
      languagePairId: 'lp1',
      organisation: 'cards',
      createdAt: 10,
      updatedAt: 20,
    });
  });

  it('maps a subdeck row, preserving a null parent', () => {
    expect(rowToSubdeck({ id: 's1', deck_id: 'd1', parent_id: null, title: 'Verbs', position: 3 })).toEqual({
      id: 's1',
      deckId: 'd1',
      parentId: null,
      title: 'Verbs',
      position: 3,
    });
  });

  it('maps a language pair row', () => {
    expect(rowToLanguagePair({ id: 'lp1', learning: 'Spanish', native: 'English', created_at: 5 })).toEqual({
      id: 'lp1',
      learning: 'Spanish',
      native: 'English',
      createdAt: 5,
    });
  });
});
