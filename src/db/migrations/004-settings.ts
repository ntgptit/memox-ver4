/**
 * Migration v4 — app settings (WBS 2.3, ADR 0005).
 *
 * A key/value store for app + study settings (theme mode, accent, text scale now;
 * study/reminder settings later, WBS 10.1). Offline source of truth like the rest.
 */

import type { Migration } from './types';

export const settings004: Migration = {
  version: 4,
  name: 'app_setting (key/value)',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE app_setting (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  },
};
