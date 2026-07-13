/**
 * Migration v2 — flashcard schema (WBS 4.2, ADR 0005).
 *
 * Creates `card` + `card_translation` and adds a denormalized `deck.card_count`
 * maintained by triggers, so the count stays consistent inside any transaction
 * (rollback reverts it too). `tags` is stored as a JSON array text.
 */

import type { Migration } from './types';

export const flashcards002: Migration = {
  version: 2,
  name: 'flashcards (card, card_translation, deck.card_count)',
  async up(db) {
    await db.execAsync(`
      ALTER TABLE deck ADD COLUMN card_count INTEGER NOT NULL DEFAULT 0;

      CREATE TABLE card (
        id TEXT PRIMARY KEY NOT NULL,
        deck_id TEXT NOT NULL,
        subdeck_id TEXT,
        term TEXT NOT NULL,
        meaning TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        audio_ref TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (deck_id) REFERENCES deck (id) ON DELETE CASCADE,
        FOREIGN KEY (subdeck_id) REFERENCES subdeck (id) ON DELETE SET NULL
      );

      CREATE TABLE card_translation (
        id TEXT PRIMARY KEY NOT NULL,
        card_id TEXT NOT NULL,
        text TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (card_id) REFERENCES card (id) ON DELETE CASCADE
      );

      CREATE INDEX idx_card_deck ON card (deck_id);
      CREATE INDEX idx_card_subdeck ON card (subdeck_id);
      CREATE INDEX idx_card_translation_card ON card_translation (card_id);

      -- Keep deck.card_count in step with the card table, transactionally.
      CREATE TRIGGER card_count_ai AFTER INSERT ON card
      BEGIN
        UPDATE deck SET card_count = card_count + 1 WHERE id = NEW.deck_id;
      END;

      CREATE TRIGGER card_count_ad AFTER DELETE ON card
      BEGIN
        UPDATE deck SET card_count = card_count - 1 WHERE id = OLD.deck_id;
      END;

      CREATE TRIGGER card_count_au AFTER UPDATE OF deck_id ON card
      WHEN OLD.deck_id <> NEW.deck_id
      BEGIN
        UPDATE deck SET card_count = card_count - 1 WHERE id = OLD.deck_id;
        UPDATE deck SET card_count = card_count + 1 WHERE id = NEW.deck_id;
      END;
    `);
  },
};
