/**
 * ListRow — shared composite, ported from the kit's `kit-helpers.jsx` `ListRow`
 * (`window.ListRow`): the generic settings/detail row — icon tile · title · sub ·
 * trailing, hairline divider unless `last`. Kit screens lean on this everywhere;
 * screens must use THIS instead of re-improvising rows (one-way layering).
 */

import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import type { IconName } from '../../icons';
import { MxIconTile, type MxIconTileTone } from '../surfaces/MxIconTile';

export interface ListRowProps {
  icon?: IconName | string;
  tone?: MxIconTileTone;
  title: string;
  sub?: string;
  trailing?: ReactNode;
  /** Suppresses the divider + bottom rhythm on the final row of a card. */
  last?: boolean;
  /** Dims the row (kit `muted` → `--memox-opacity-muted`). */
  muted?: boolean;
  onPress?: () => void;
  node?: string;
  style?: StyleProp<ViewStyle>;
}

export function ListRow({
  icon,
  tone,
  title,
  sub,
  trailing,
  last = false,
  muted = false,
  onPress,
  node,
  style,
}: ListRowProps) {
  const t = useTheme();

  const row = (
    <View
      testID={onPress ? undefined : node}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space[4],
          opacity: muted ? t.opacity.muted : 1,
          paddingBottom: last ? 0 : t.space[4],
          marginBottom: last ? 0 : t.space[4],
          borderBottomWidth: last ? 0 : t.stroke.hairline,
          borderBottomColor: t.color.divider,
        },
        style,
      ]}
    >
      {icon !== undefined && <MxIconTile icon={icon} tone={tone} />}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>
          {title}
        </Text>
        {sub !== undefined && (
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, marginTop: t.space[1] }]}>
            {sub}
          </Text>
        )}
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <Pressable testID={node} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
        {row}
      </Pressable>
    );
  }
  return row;
}
