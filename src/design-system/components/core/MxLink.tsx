/**
 * MxLink (WBS 1.7) — base class `link` (ADR 0004). An inline text action in the
 * accent colour; defaults to a trailing `chevron_right`. `href`→`onPress`. `size`.
 */

import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export type MxLinkSize = 'md' | 'sm';

export interface MxLinkProps {
  children?: ReactNode;
  icon?: IconName | string;
  /** Trailing icon; defaults to `chevron_right`. Pass `null` to omit. */
  trailingIcon?: IconName | string | null;
  onPress?: () => void;
  size?: MxLinkSize;
  accessibilityLabel?: string;
  node?: string;
}

export function MxLink({
  children,
  icon,
  trailingIcon = 'chevron_right',
  onPress,
  size = 'md',
  accessibilityLabel,
  node,
}: MxLinkProps) {
  const t = useTheme();
  const fg = t.color.accent;
  const glyph = size === 'sm' ? t.iconSize.sm : t.iconSize.md;

  return (
    <Pressable
      testID={node}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignSelf: 'flex-start',
          alignItems: 'center',
          gap: t.space[1],
          minHeight: t.layout.touchMin,
          paddingHorizontal: t.space[1],
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {icon !== undefined && (
        <View>
          <Icon name={icon} size={glyph} color={fg} />
        </View>
      )}
      <Text style={[t.font.text({ size: size === 'sm' ? 'sm' : 'base', weight: 'bold' }), { color: fg }]}>
        {children}
      </Text>
      {trailingIcon !== null && trailingIcon !== undefined && (
        <View>
          <Icon name={trailingIcon} size={glyph} color={fg} />
        </View>
      )}
    </Pressable>
  );
}
