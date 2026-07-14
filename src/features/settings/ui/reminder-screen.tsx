/**
 * Reminder screen (WBS 8.2) — daily study reminders. Composition mirrors the
 * kit `_features/reminder/Reminder.jsx`: nested bar (back · Reminders) →
 * toggle card (ListRow + switch) → reminder-time card (label + 3xl time +
 * schedule edit) → REPEAT weekday chips — the time/days block dims to half
 * opacity while off — plus the hour:minute TimePickerSheet. 3 states.
 */

import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  AppScreen,
  ListRow,
  MxButton,
  MxCard,
  MxChip,
  MxIconButton,
  MxSwitch,
  Scrim,
  SectionLabel,
  Sheet,
  useTheme,
} from '@/design-system';

import {
  PICKER_HOURS,
  PICKER_MINUTES,
  REMINDER_WEEKDAYS,
  type ReminderConfig,
  type ReminderUiState,
} from './reminder-fixtures';

export interface ReminderScreenProps {
  config: ReminderConfig;
  ui?: ReminderUiState;
  onBack?: () => void;
  onToggle?: (enabled: boolean) => void;
  onToggleDay?: (index: number) => void;
  onOpenPicker?: () => void;
  onClosePicker?: () => void;
  /** Persist the picked "HH:MM". */
  onPickTime?: (time: string) => void;
}

export function ReminderScreen({
  config,
  ui = config.enabled ? 'on' : 'off',
  onBack,
  onToggle,
  onToggleDay,
  onOpenPicker,
  onClosePicker,
  onPickTime,
}: ReminderScreenProps) {
  const t = useTheme();
  const on = config.enabled;

  return (
    <>
      <AppScreen
        node="reminder/screen"
        variant="nested"
        title="Reminders"
        leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="reminder/back" />}
      >
        <MxCard padding="sm">
          <ListRow
            icon="notifications"
            tone="warning"
            title="Study reminders"
            sub="Remind you to review every day"
            last
            node="reminder/toggle"
            trailing={<MxSwitch checked={on} onChange={onToggle} ariaLabel="Study reminders" node="reminder/toggle-switch" />}
          />
        </MxCard>

        <MxCard interactive onPress={on ? onOpenPicker : undefined} accessibilityLabel="Reminder time" node="reminder/time" style={{ opacity: on ? 1 : t.opacity.half }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <SectionLabel uppercase style={{ marginTop: 0, marginLeft: 0 }}>
                Reminder time
              </SectionLabel>
              <Text
                style={[
                  t.font.text({ size: '3xl', weight: 'extrabold', letterSpacing: 'tight' }),
                  { color: t.color.text },
                ]}
              >
                {config.time}
              </Text>
            </View>
            <MxIconButton icon="schedule" accessibilityLabel="Change time" onPress={on ? onOpenPicker : undefined} node="reminder/time-edit" />
          </View>
        </MxCard>

        <View testID="reminder/days" style={{ opacity: on ? 1 : t.opacity.half }}>
          <SectionLabel uppercase style={{ marginTop: 0, marginBottom: t.space[2] }}>
            Repeat
          </SectionLabel>
          <View style={{ flexDirection: 'row', gap: t.space[2], flexWrap: 'wrap' }}>
            {REMINDER_WEEKDAYS.map((d, i) => (
              <MxChip
                key={d}
                label={d}
                selected={on && config.days[i]}
                onPress={on ? () => onToggleDay?.(i) : undefined}
                node={`reminder/day-${i}`}
              />
            ))}
          </View>
        </View>
      </AppScreen>

      {ui === 'time-picker' && (
        <TimePickerSheet time={config.time} onDone={onPickTime} onDismiss={onClosePicker} />
      )}
    </>
  );
}

/** Kit TimePickerSheet: hour + minute columns with a primary Done. */
function TimePickerSheet({
  time,
  onDone,
  onDismiss,
}: {
  time: string;
  onDone?: (time: string) => void;
  onDismiss?: () => void;
}) {
  const t = useTheme();
  const [initialHour, initialMinute] = time.split(':');
  const [hour, setHour] = useState(PICKER_HOURS.includes(initialHour as (typeof PICKER_HOURS)[number]) ? initialHour : '13');
  const [minute, setMinute] = useState(
    PICKER_MINUTES.includes(initialMinute as (typeof PICKER_MINUTES)[number]) ? initialMinute : '00',
  );

  return (
    <Scrim align="end" onDismiss={onDismiss} node="reminder/picker-scrim">
      <Sheet title="Pick reminder time" node="reminder/picker-sheet">
        <View style={{ flexDirection: 'row', gap: t.space[3], alignItems: 'center', justifyContent: 'center' }}>
          <TimeCol values={PICKER_HOURS} sel={hour} onPick={setHour} node="reminder/hours" />
          <Text style={[t.font.text({ size: 'xl', weight: 'extrabold' }), { color: t.color.text }]}>:</Text>
          <TimeCol values={PICKER_MINUTES} sel={minute} onPick={setMinute} node="reminder/minutes" />
        </View>
        <View style={{ marginTop: t.space[2] }}>
          <MxButton variant="primary" block onPress={() => onDone?.(`${hour}:${minute}`)} node="reminder/picker-done">
            Done
          </MxButton>
        </View>
      </Sheet>
    </Scrim>
  );
}

/** Kit TimeCol: one scrollable value column; the selection is primary/extrabold. */
function TimeCol({
  values,
  sel,
  onPick,
  node,
}: {
  values: readonly string[];
  sel: string;
  onPick?: (v: string) => void;
  node?: string;
}) {
  const t = useTheme();
  return (
    <ScrollView testID={node} style={{ flex: 1, maxHeight: t.size['2xl'] }} showsVerticalScrollIndicator={false}>
      {values.map((v) => (
        <Pressable
          key={v}
          testID={node ? `${node}-${v}` : undefined}
          accessibilityRole="button"
          accessibilityLabel={v}
          accessibilityState={{ selected: v === sel }}
          onPress={() => onPick?.(v)}
          style={{ paddingVertical: t.space[2], alignItems: 'center' }}
        >
          <Text
            style={[
              t.font.text({ size: 'md', weight: v === sel ? 'extrabold' : 'medium' }),
              { color: v === sel ? t.color.primary : t.color.textTertiary },
            ]}
          >
            {v}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
