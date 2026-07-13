/**
 * Theme settings screen (WBS 2.3). Appearance (light/dark/system), an accent picker,
 * and a text-size control — each persisted and previewed live: the screen itself is
 * rendered from the theme, so changing any control reskins it immediately.
 */

import { Pressable, Text, View } from 'react-native';

import {
  AppScreen,
  MxCard,
  MxSectionHeader,
  MxSegmentedControl,
  MxIconButton,
  MxButton,
  useTheme,
  useThemeSettings,
  type AccentChoice,
  type ThemeMode,
} from '@/design-system';
import { TEXT_SCALES } from '@/features/settings/data';

const APPEARANCE = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const ACCENT_OPTIONS: { value: AccentChoice; label: string }[] = [
  { value: 'brand', label: 'Deep violet' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'violet', label: 'Violet' },
  { value: 'green', label: 'Green' },
  { value: 'coral', label: 'Coral' },
  { value: 'amber', label: 'Amber' },
  { value: 'cyan', label: 'Cyan' },
];

function AccentSwatch({
  value,
  label,
  selected,
  onPress,
}: {
  value: AccentChoice;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const color = value === 'brand' ? t.color.primary : t.paletteAccents[value];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={{ alignItems: 'center', gap: t.space[1], width: t.layout.touchMin + t.space[2] }}
    >
      <View
        style={{
          width: t.layout.touchMin,
          height: t.layout.touchMin,
          borderRadius: t.radius.full,
          backgroundColor: color,
          borderWidth: selected ? t.stroke.bold : 0,
          borderColor: t.color.focusRing,
        }}
      />
      <Text numberOfLines={1} style={[t.font.text({ size: 'xs' }), { color: t.color.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ThemeScreen({ onBack }: { onBack?: () => void }) {
  const t = useTheme();
  const { mode, setMode, accent, setAccent, textScale, setTextScale } = useThemeSettings();

  return (
    <AppScreen
      node="theme/screen"
      variant="nested"
      title="Theme"
      leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} />}
    >
      <View style={{ gap: t.space[2] }}>
        <MxSectionHeader title="Appearance" />
        <MxSegmentedControl
          node="theme/appearance"
          block
          segments={APPEARANCE}
          value={mode}
          onChange={(v) => setMode(v as ThemeMode)}
        />
      </View>

      <View style={{ gap: t.space[3] }}>
        <MxSectionHeader title="Accent" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[3] }}>
          {ACCENT_OPTIONS.map((opt) => (
            <AccentSwatch
              key={opt.value}
              value={opt.value}
              label={opt.label}
              selected={accent === opt.value}
              onPress={() => setAccent(opt.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: t.space[2] }}>
        <MxSectionHeader title="Text size" />
        <MxSegmentedControl
          node="theme/text-size"
          block
          segments={TEXT_SCALES.map((s) => ({ value: String(s.value), label: s.label }))}
          value={String(textScale)}
          onChange={(v) => setTextScale(Number(v))}
        />
      </View>

      <MxCard node="theme/preview" variant="flat">
        <MxSectionHeader title="Preview" caption="Your theme, applied live" />
        <Text style={[t.font.text({ size: 'lg', weight: 'bold' }), { color: t.color.text }]}>Good evening, Linh</Text>
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
          12 cards due across 3 decks
        </Text>
        <MxButton variant="primary" icon="bolt" onPress={() => {}}>
          Start review
        </MxButton>
      </MxCard>
    </AppScreen>
  );
}
