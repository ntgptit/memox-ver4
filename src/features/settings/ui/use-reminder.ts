/**
 * Reminder controller (WBS 8.2) — drives the reminder config: every change
 * persists (0.5 storage) AND re-schedules the local notifications (DEP-
 * NOTIFICATIONS): enabled → weekly triggers at HH:MM for each chosen weekday;
 * disabled or no days → everything cancelled.
 */

import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_REMINDER, type ReminderConfig, type ReminderUiState } from './reminder-fixtures';

export interface ReminderDeps {
  load: () => Promise<ReminderConfig>;
  save: (config: ReminderConfig) => Promise<void>;
  /** Replace all scheduled reminders with the config's (no-op when disabled). */
  reschedule: (config: ReminderConfig) => Promise<void>;
}

export interface ReminderController {
  config: ReminderConfig;
  ui: ReminderUiState;
  toggle: (enabled: boolean) => void;
  toggleDay: (index: number) => void;
  openPicker: () => void;
  closePicker: () => void;
  pickTime: (time: string) => void;
}

export function useReminder(deps: ReminderDeps | null): ReminderController {
  const [config, setConfig] = useState<ReminderConfig>(DEFAULT_REMINDER);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (deps === null) return;
    let alive = true;
    void deps.load().then((loaded) => {
      if (alive) setConfig(loaded);
    });
    return () => {
      alive = false;
    };
  }, [deps]);

  const apply = useCallback(
    (next: ReminderConfig) => {
      setConfig(next);
      if (deps !== null) {
        void deps.save(next).then(() => deps.reschedule(next));
      }
    },
    [deps],
  );

  const toggle = useCallback((enabled: boolean) => apply({ ...config, enabled }), [apply, config]);

  const toggleDay = useCallback(
    (index: number) => {
      apply({ ...config, days: config.days.map((d, i) => (i === index ? !d : d)) });
    },
    [apply, config],
  );

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  const pickTime = useCallback(
    (time: string) => {
      setPickerOpen(false);
      apply({ ...config, time });
    },
    [apply, config],
  );

  const ui: ReminderUiState = pickerOpen ? 'time-picker' : config.enabled ? 'on' : 'off';
  return { config, ui, toggle, toggleDay, openPicker, closePicker, pickTime };
}
