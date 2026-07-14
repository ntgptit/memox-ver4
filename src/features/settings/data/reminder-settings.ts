/**
 * Reminder persistence (WBS 8.2) — the typed reminder config over the
 * app_setting key/value repository (0.5 storage strategy): survives restarts,
 * versioned by shape validation (bad/missing JSON → the default).
 */

import { DEFAULT_REMINDER, type ReminderConfig } from '../ui/reminder-fixtures';
import type { SettingsRepository } from './settings-repository';
import { isErr } from '@/shared';

const KEY = 'reminder';

export async function loadReminderConfig(repo: SettingsRepository): Promise<ReminderConfig> {
  const r = await repo.get(KEY);
  if (isErr(r) || r.value === null) return DEFAULT_REMINDER;
  try {
    const parsed: unknown = JSON.parse(r.value);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as { enabled?: unknown }).enabled === 'boolean' &&
      typeof (parsed as { time?: unknown }).time === 'string' &&
      Array.isArray((parsed as { days?: unknown }).days) &&
      (parsed as { days: unknown[] }).days.length === 7
    ) {
      const p = parsed as { enabled: boolean; time: string; days: unknown[] };
      return { enabled: p.enabled, time: p.time, days: p.days.map((d) => d === true) };
    }
  } catch {
    // fall through to the default
  }
  return DEFAULT_REMINDER;
}

export async function saveReminderConfig(repo: SettingsRepository, config: ReminderConfig): Promise<void> {
  await repo.set(KEY, JSON.stringify(config));
}
