/**
 * MxFab (WBS 1.6) — base class `fab` (ADR 0004). The floating action button:
 * 56px tall, brand-filled, elevated. `label` makes it extended (icon + text);
 * `round` forces a circular icon-only FAB; `variant` accent uses the accent colour.
 */

import { Pressable, Text, View } from 'react-native';

import { useTheme, type Theme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export type MxFabVariant = 'primary' | 'accent';

export interface MxFabProps {
  icon: IconName | string;
  label?: string;
  variant?: MxFabVariant;
  round?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  node?: string;
}

function fabColors(t: Theme, variant: MxFabVariant): { bg: string; fg: string } {
  return variant === 'accent'
    ? { bg: t.color.accent, fg: t.color.onAccent }
    : { bg: t.color.primary, fg: t.color.onPrimary };
}

export function MxFab({
  icon,
  label,
  variant = 'primary',
  round = false,
  onPress,
  disabled = false,
  accessibilityLabel,
  node,
}: MxFabProps) {
  const t = useTheme();
  const { bg, fg } = fabColors(t, variant);
  const extended = label !== undefined && !round;

  return (
    <Pressable
      testID={node}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          height: t.layout.fabSize,
          minWidth: t.layout.fabSize,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.space[2],
          paddingHorizontal: extended ? t.space[6] : 0,
          width: extended ? undefined : t.layout.fabSize,
          borderRadius: round ? t.radius.full : t.radius.xl,
          backgroundColor: bg,
          opacity: disabled ? t.opacity.disabled : pressed ? 0.9 : 1,
        },
        t.elevation.fab,
      ]}
    >
      <View>
        <Icon name={icon} size={t.iconSize.lg} color={fg} />
      </View>
      {extended && (
        <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}
