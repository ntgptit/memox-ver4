/**
 * Reminder controller + persistence (WBS 8.2) — every change persists AND
 * reschedules; the config round-trips through the settings repository
 * (restart-safe per 0.5); bad stored JSON falls back to the default.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { ok } from '@/shared';
import type { SettingsRepository } from '@/features/settings/data';
import { loadReminderConfig, saveReminderConfig } from '@/features/settings/data';

import { useReminder, type ReminderDeps } from '../use-reminder';
import { DEFAULT_REMINDER, type ReminderConfig } from '../reminder-fixtures';

class FakeSettingsRepo implements SettingsRepository {
  store = new Map<string, string>();
  subscribe() {
    return () => {};
  }
  async get(key: string) {
    return ok(this.store.get(key) ?? null);
  }
  async set(key: string, value: string) {
    this.store.set(key, value);
    return ok(undefined);
  }
}

describe('reminder persistence (0.5)', () => {
  it('round-trips the config through app_setting', async () => {
    const repo = new FakeSettingsRepo();
    const config: ReminderConfig = { enabled: false, time: '14:30', days: [true, false, true, false, true, false, true] };
    await saveReminderConfig(repo, config);
    expect(await loadReminderConfig(repo)).toEqual(config);
  });

  it('missing or corrupt JSON falls back to the default', async () => {
    const repo = new FakeSettingsRepo();
    expect(await loadReminderConfig(repo)).toEqual(DEFAULT_REMINDER);
    repo.store.set('reminder', '{nope');
    expect(await loadReminderConfig(repo)).toEqual(DEFAULT_REMINDER);
  });
});

function makeDeps(initial = DEFAULT_REMINDER) {
  const saved: ReminderConfig[] = [];
  const scheduled: ReminderConfig[] = [];
  const deps: ReminderDeps & { saved: ReminderConfig[]; scheduled: ReminderConfig[] } = {
    load: async () => initial,
    save: async (c) => {
      saved.push(c);
    },
    reschedule: async (c) => {
      scheduled.push(c);
    },
    saved,
    scheduled,
  };
  return deps;
}

describe('useReminder — persist + reschedule on every change', () => {
  it('toggle off persists and reschedules with enabled=false', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useReminder(deps));
    await waitFor(() => expect(result.current.config.enabled).toBe(true));
    act(() => result.current.toggle(false));
    expect(result.current.ui).toBe('off');
    await waitFor(() => expect(deps.scheduled.length).toBe(1));
    expect(deps.saved[0]?.enabled).toBe(false);
    expect(deps.scheduled[0]?.enabled).toBe(false);
  });

  it('picking a time closes the picker, persists and reschedules', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useReminder(deps));
    await waitFor(() => expect(result.current.config.time).toBe('13:00'));
    act(() => result.current.openPicker());
    expect(result.current.ui).toBe('time-picker');
    act(() => result.current.pickTime('14:30'));
    expect(result.current.ui).toBe('on');
    expect(result.current.config.time).toBe('14:30');
    await waitFor(() => expect(deps.saved.some((c) => c.time === '14:30')).toBe(true));
  });

  it('toggling a weekday flips only that day and reschedules', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useReminder(deps));
    await waitFor(() => expect(result.current.config.days.every(Boolean)).toBe(true));
    act(() => result.current.toggleDay(2));
    expect(result.current.config.days[2]).toBe(false);
    expect(result.current.config.days[0]).toBe(true);
    await waitFor(() => expect(deps.scheduled.length).toBe(1));
  });
});
