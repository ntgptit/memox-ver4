/**
 * Migration v1 — content schema (WBS 3.2, ADR 0005).
 *
 * Creates the language_pair / deck / subdeck tables (cards + sessions arrive with
 * their slices in later migrations). FKs cascade so deleting a deck removes its
 * subdecks; the domain (WBS 3.1) enforces the higher invariants.
 */

import type { Migration } from './types';

export const content001: Migration = {
  version: 1,
  name: 'content (language_pair, deck, subdeck)',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE language_pair (
        id TEXT PRIMARY KEY NOT NULL,
        learning TEXT NOT NULL,
        native TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE deck (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        language_pair_id TEXT NOT NULL,
        organisation TEXT NOT NULL CHECK (organisation IN ('subdecks', 'cards')),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (language_pair_id) REFERENCES language_pair (id) ON DELETE CASCADE
      );

      CREATE TABLE subdeck (
        id TEXT PRIMARY KEY NOT NULL,
        deck_id TEXT NOT NULL,
        parent_id TEXT,
        title TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (deck_id) REFERENCES deck (id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES subdeck (id) ON DELETE CASCADE
      );

      CREATE INDEX idx_deck_language_pair ON deck (language_pair_id);
      CREATE INDEX idx_subdeck_deck ON subdeck (deck_id);
      CREATE INDEX idx_subdeck_parent ON subdeck (parent_id);
    `);
  },
};
