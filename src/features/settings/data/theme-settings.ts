/**
 * Theme settings persistence (WBS 2.3). Typed load/save of the theme preferences
 * (mode / accent / text scale) over the {@link SettingsRepository} key/value store.
 * Values are validated on read so a corrupt/absent row degrades to the default.
 */

import { isOk } from '@/shared';
import type { ThemeMode, ThemeSettings, AccentChoice } from '@/design-system';
import type { SettingsRepository } from './settings-repository';

const KEY = { mode: 'theme.mode', accent: 'theme.accent', textScale: 'theme.textScale' } as const;

export const DEFAULT_THEME_SETTINGS: ThemeSettings = { mode: 'system', accent: 'brand', textScale: 1 };

/** The offered type scales (small / default / large). */
export const TEXT_SCALES = [
  { value: 0.9, label: 'Small' },
  { value: 1, label: 'Default' },
  { value: 1.15, label: 'Large' },
] as const;

const ACCENTS: AccentChoice[] = ['brand', 'indigo', 'violet', 'green', 'coral', 'amber', 'cyan'];

function parseMode(v: string): ThemeMode {
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}
function parseAccent(v: string): AccentChoice {
  return (ACCENTS as string[]).includes(v) ? (v as AccentChoice) : 'brand';
}
function parseScale(v: string): number {
  const n = Number(v);
  return TEXT_SCALES.some((s) => s.value === n) ? n : 1;
}

export async function loadThemeSettings(repo: SettingsRepository): Promise<ThemeSettings> {
  const [m, a, s] = await Promise.all([repo.get(KEY.mode), repo.get(KEY.accent), repo.get(KEY.textScale)]);
  return {
    mode: isOk(m) && m.value !== null ? parseMode(m.value) : DEFAULT_THEME_SETTINGS.mode,
    accent: isOk(a) && a.value !== null ? parseAccent(a.value) : DEFAULT_THEME_SETTINGS.accent,
    textScale: isOk(s) && s.value !== null ? parseScale(s.value) : DEFAULT_THEME_SETTINGS.textScale,
  };
}

export async function saveThemeSettings(
  repo: SettingsRepository | null,
  settings: ThemeSettings,
): Promise<void> {
  if (repo === null) {
    return;
  }
  await repo.set(KEY.mode, settings.mode);
  await repo.set(KEY.accent, settings.accent);
  await repo.set(KEY.textScale, String(settings.textScale));
}
