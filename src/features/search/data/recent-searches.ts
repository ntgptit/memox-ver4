/**
 * Recent-search history (WBS 4.6) persisted via the app-settings key/value store
 * (WBS 2.3). Most-recent-first, de-duplicated case-insensitively, capped at {@link MAX}.
 * A corrupt/missing value degrades to an empty list — history is best-effort.
 */

import { isErr } from '@/shared';
import type { SettingsRepository } from '@/features/settings/data';

const KEY = 'search.recent';
export const MAX_RECENT = 8;

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export async function loadRecent(settings: SettingsRepository): Promise<string[]> {
  const res = await settings.get(KEY);
  return isErr(res) ? [] : parse(res.value);
}

async function persist(settings: SettingsRepository, list: string[]): Promise<string[]> {
  await settings.set(KEY, JSON.stringify(list));
  return list;
}

/** Record a query at the front (trimmed, deduped case-insensitively, capped). Blank is ignored. */
export async function addRecent(settings: SettingsRepository, query: string): Promise<string[]> {
  const q = query.trim();
  if (q.length === 0) return loadRecent(settings);
  const current = await loadRecent(settings);
  const deduped = current.filter((r) => r.toLowerCase() !== q.toLowerCase());
  return persist(settings, [q, ...deduped].slice(0, MAX_RECENT));
}

export async function removeRecent(settings: SettingsRepository, query: string): Promise<string[]> {
  const current = await loadRecent(settings);
  return persist(
    settings,
    current.filter((r) => r.toLowerCase() !== query.toLowerCase()),
  );
}

export async function clearRecent(settings: SettingsRepository): Promise<string[]> {
  return persist(settings, []);
}
