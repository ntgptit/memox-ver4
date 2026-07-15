/**
 * Unit tests for the flashcard row ↔ entity mappers (WBS 4.2). Pure, no DB.
 */

import { rowToCard, rowToCardTranslation, serializeTags } from '@/features/flashcards/data';

describe('flashcard mappers (WBS 4.2)', () => {
  it('parses tags JSON and maps a card row', () => {
    const c = rowToCard({
      id: 'c1',
      deck_id: 'd1',
      subdeck_id: null,
      term: 'hola',
      meaning: 'hello',
      tags: '["greeting","a1"]',
      audio_ref: 'a.mp3',
    hidden: 0,
      created_at: 10,
      updated_at: 20,
    });
    expect(c.tags).toEqual(['greeting', 'a1']);
    expect(c.audioRef).toBe('a.mp3');
    expect(c.subdeckId).toBeNull();
  });

  it('degrades malformed tags to an empty array (no throw)', () => {
    const c = rowToCard({
      id: 'c1',
      deck_id: 'd1',
      subdeck_id: null,
      term: 't',
      meaning: 'm',
      tags: 'not json',
      audio_ref: null,
    hidden: 0,
      created_at: 0,
      updated_at: 0,
    });
    expect(c.tags).toEqual([]);
  });

  it('serializeTags round-trips through rowToCard', () => {
    const tags = ['x', 'y'];
    expect(serializeTags(tags)).toBe('["x","y"]');
  });

  it('maps a card translation row', () => {
    expect(rowToCardTranslation({ id: 't1', card_id: 'c1', text: 'hi', position: 2 })).toEqual({
      id: 't1',
      cardId: 'c1',
      text: 'hi',
      position: 2,
    });
  });
});
