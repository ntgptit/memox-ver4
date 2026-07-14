/**
 * Reminder container (WBS 8.2) — resolves the settings repository, persists the
 * config, and (re)schedules the local notifications via expo-notifications:
 * one weekly trigger per chosen weekday at HH:MM. Native only — web has no
 * local-notification scheduling, so scheduling is a guarded no-op there.
 */

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { createSettingsRepository, loadReminderConfig, saveReminderConfig } from '@/features/settings/data';

import { ReminderScreen } from './reminder-screen';
import { useReminder, type ReminderDeps } from './use-reminder';
import type { ReminderConfig } from './reminder-fixtures';

async function rescheduleNative(config: ReminderConfig): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!config.enabled) return;
  const granted = await Notifications.requestPermissionsAsync();
  if (!granted.granted) return;
  const [hour, minute] = config.time.split(':').map(Number);
  // Mon-first UI index → expo weekday (1 = Sunday … 7 = Saturday).
  const weekdays = config.days.flatMap((on, i) => (on ? [((i + 1) % 7) + 1] : []));
  await Promise.all(
    weekdays.map((weekday) =>
      Notifications.scheduleNotificationAsync({
        content: { title: 'Time to review', body: 'Keep your streak — study a few cards now.' },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
        },
      }),
    ),
  );
}

export function ReminderContainer({ onBack }: { onBack?: () => void }) {
  const [deps, setDeps] = useState<ReminderDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void createSettingsRepository().then((repo) => {
      if (!alive) return;
      setDeps({
        load: () => loadReminderConfig(repo),
        save: (config) => saveReminderConfig(repo, config),
        reschedule: rescheduleNative,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  const ctrl = useReminder(deps);

  return (
    <ReminderScreen
      config={ctrl.config}
      ui={ctrl.ui}
      onBack={onBack}
      onToggle={ctrl.toggle}
      onToggleDay={ctrl.toggleDay}
      onOpenPicker={ctrl.openPicker}
      onClosePicker={ctrl.closePicker}
      onPickTime={ctrl.pickTime}
    />
  );
}
