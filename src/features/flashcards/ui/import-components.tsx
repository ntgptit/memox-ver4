/**
 * Import feature-local components (WBS 9.1) — RN ports of the kit's
 * `_features/import/components/{SourceCard,Table}.jsx`: one import-source option
 * card and the bordered 2-column preview table (header row sunken + bold).
 */

import { Text, View } from 'react-native';

import { Icon, MxCard, MxIconTile, useTheme } from '@/design-system';

import type { ImportSource } from './import-fixtures';

export function SourceCard({
  source,
  index,
  onPress,
}: {
  source: ImportSource;
  index: number;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <MxCard
      interactive
      padding="sm"
      onPress={onPress}
      accessibilityLabel={source.name}
      node={`import/source-${index}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
        <MxIconTile icon={source.icon} tone={index === 2 ? 'accent' : 'default'} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>{source.name}</Text>
          <Text
            style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, marginTop: t.space[1] }]}
          >
            {source.desc}
          </Text>
        </View>
        <Icon name="chevron_right" size={t.iconSize.md} color={t.color.textTertiary} />
      </View>
    </MxCard>
  );
}

export function Table({ rows, node }: { rows: readonly (readonly [string, string])[]; node?: string }) {
  const t = useTheme();
  return (
    <View
      testID={node}
      style={{
        borderWidth: t.stroke.hairline,
        borderColor: t.color.divider,
        borderRadius: t.radius.control,
        overflow: 'hidden',
      }}
    >
      {rows.map((r, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            gap: t.space[3],
            paddingVertical: t.space[3],
            paddingHorizontal: t.space[4],
            borderTopWidth: i === 0 ? 0 : t.stroke.hairline,
            borderTopColor: t.color.divider,
            backgroundColor: i === 0 ? t.color.surfaceSunken : 'transparent',
          }}
        >
          <Text style={[t.font.text({ size: 'sm', weight: 'bold' }), { flex: 1, color: t.color.text }]}>{r[0]}</Text>
          <Text
            style={[
              t.font.text({ size: 'sm', weight: i === 0 ? 'bold' : 'regular' }),
              { flex: 1.4, color: i === 0 ? t.color.text : t.color.textSecondary },
            ]}
          >
            {r[1]}
          </Text>
        </View>
      ))}
    </View>
  );
}
