/**
 * Migration v3 — study/session schema (WBS 5.2, ADR 0005).
 *
 * `srs_state` (per-card scheduling, keyed by card), `session` (the ordered card set
 * stored as JSON in `card_ids` so a resume is lossless), and `attempt` (one per
 * stage answer). FKs cascade on card/deck/session delete.
 */

import type { Migration } from './types';

export const sessions003: Migration = {
  version: 3,
  name: 'sessions (srs_state, session, attempt)',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE srs_state (
        card_id TEXT PRIMARY KEY NOT NULL,
        due_at INTEGER NOT NULL,
        interval INTEGER NOT NULL,
        ease REAL NOT NULL,
        reps INTEGER NOT NULL,
        lapses INTEGER NOT NULL,
        stage TEXT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES card (id) ON DELETE CASCADE
      );

      CREATE TABLE session (
        id TEXT PRIMARY KEY NOT NULL,
        deck_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        card_ids TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL CHECK (status IN ('active', 'finalized')),
        started_at INTEGER NOT NULL,
        finalized_at INTEGER,
        FOREIGN KEY (deck_id) REFERENCES deck (id) ON DELETE CASCADE
      );

      CREATE TABLE attempt (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        stage TEXT NOT NULL,
        result TEXT NOT NULL,
        answered_at INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES session (id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES card (id) ON DELETE CASCADE
      );

      CREATE INDEX idx_srs_due ON srs_state (due_at);
      CREATE INDEX idx_session_deck ON session (deck_id);
      CREATE INDEX idx_attempt_session ON attempt (session_id);
    `);
  },
};
