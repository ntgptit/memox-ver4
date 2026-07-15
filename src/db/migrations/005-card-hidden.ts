/**
 * Migration v5 — card `hidden` flag (WBS 12.11 B2 "Hide card").
 *
 * A hidden card stays in the deck's card list but is excluded from study
 * sessions. Forward-only, defaults to 0 so existing cards stay visible.
 */

import type { Migration } from './types';

export const cardHidden005: Migration = {
  version: 5,
  name: 'card.hidden flag',
  async up(db) {
    await db.execAsync(`ALTER TABLE card ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;`);
  },
};
