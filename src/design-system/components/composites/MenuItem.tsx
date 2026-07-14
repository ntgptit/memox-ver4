/**
 * MenuItem — shared full-width sheet row, ported from the kit's `kit-helpers.jsx`
 * `MenuItem` (`window.MenuItem`): a tappable row of icon · label · trailing, sized
 * for a bottom Sheet. `danger` recolors to error; `selected` renders a primary
 * check (an explicit `trailing` still wins).
 */

import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export interface MenuItemProps {
  icon: IconName | string;
  label: string;
  /** Icon tint override (kit `tone`); ignored when `danger`. */
  tone?: string;
  danger?: boolean;
  selected?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
  node?: string;
}

export function MenuItem({ icon, label, tone, danger = false, selected = false, trailing, onPress, node }: MenuItemProps) {
  const t = useTheme();
  const labelColor = danger ? t.color.error : t.color.text;
  const iconColor = danger ? t.color.error : (tone ?? t.color.textSecondary);
  const mark = selected ? <Icon name="check" size={t.iconSize.md} color={t.color.primary} /> : trailing;

  return (
    <Pressable
      testID={node}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      // Kit MenuItem has no min-height — the row is its 12px padding around the
      // icon/label (~46px); the ≥48 target is met via hitSlop, like the kit's ::after.
      hitSlop={t.space[1]}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[4],
        paddingVertical: t.space[3],
        paddingHorizontal: t.space[2],
        borderRadius: t.radius.control,
      }}
    >
      <Icon name={icon} size={t.iconSize.md} color={iconColor} />
      <Text style={[t.font.text({ size: 'base', weight: 'semibold' }), { flex: 1, color: labelColor }]}>{label}</Text>
      {mark ? <View>{mark}</View> : null}
    </Pressable>
  );
}
