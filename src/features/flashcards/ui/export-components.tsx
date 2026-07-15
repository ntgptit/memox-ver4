/**
 * Export feature-local components (WBS 9.2) — RN ports of the kit's
 * `_features/export/components/{ExportingCard,FormatList}.jsx`: the in-progress
 * card (sync glyph + bold label + bar) and the format radio list.
 */

import { Text, View } from 'react-native';

import { Icon, ListRow, MxCard, ProgressBar, useTheme } from '@/design-system';

import { EXPORT_FORMATS } from './export-fixtures';

export function ExportingCard({ progressPct }: { progressPct: number }) {
  const t = useTheme();
  return (
    <MxCard node="export/progress" style={{ alignItems: 'center', gap: t.space[4], padding: t.space[7] }}>
      <Icon name="sync" size={t.font.size['3xl']} color={t.color.primary} />
      <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>Exporting…</Text>
      <View style={{ width: '100%' }}>
        <ProgressBar value={progressPct} height={8} accessibilityLabel="Export progress" node="export/bar" />
      </View>
    </MxCard>
  );
}

export function FormatList({
  selectedIndex,
  onPick,
}: {
  selectedIndex: number;
  onPick?: (index: number) => void;
}) {
  const t = useTheme();
  return (
    <MxCard padding="sm">
      {EXPORT_FORMATS.map((f, i) => (
        <ListRow
          key={f.id}
          icon={f.icon}
          title={f.name}
          sub={f.sub}
          last={i === EXPORT_FORMATS.length - 1}
          node={`export/format-${f.id}`}
          onPress={onPick === undefined ? undefined : () => onPick(i)}
          selected={i === selectedIndex}
          trailing={
            <Icon
              name={i === selectedIndex ? 'radio_button_checked' : 'radio_button_unchecked'}
              size={t.iconSize.md}
              color={i === selectedIndex ? t.color.primary : t.color.textTertiary}
            />
          }
        />
      ))}
    </MxCard>
  );
}
