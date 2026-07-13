/**
 * MxIconButton (WBS 1.6) — base class `icon-btn` (ADR 0004). A round, icon-only
 * button. `variant`: ghost (default) / filled / primary. `size` `sm` renders a
 * smaller visual but keeps a ≥48px hit area (hitSlop). `node` → `testID`.
 */

import { Pressable, View } from 'react-native';

import { useTheme, type Theme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export type MxIconButtonVariant = 'ghost' | 'filled' | 'primary';
export type MxIconButtonSize = 'md' | 'sm';

export interface MxIconButtonProps {
  icon: IconName | string;
  variant?: MxIconButtonVariant;
  size?: MxIconButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  node?: string;
}

function variantColors(t: Theme, variant: MxIconButtonVariant): { bg: string; fg: string; shadow?: object } {
  switch (variant) {
    case 'filled':
      return { bg: t.color.surface, fg: t.color.text, shadow: t.elevation.sm };
    case 'primary':
      return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft };
    case 'ghost':
    default:
      return { bg: 'transparent', fg: t.color.text };
  }
}

export function MxIconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  onPress,
  disabled = false,
  accessibilityLabel,
  node,
}: MxIconButtonProps) {
  const t = useTheme();
  const { bg, fg, shadow } = variantColors(t, variant);
  const box = size === 'sm' ? 36 : t.layout.touchMin; // touchMin = 48
  const hit = size === 'sm' ? (t.layout.touchMin - 36) / 2 : 0; // pad sm up to a 48px target
  const glyph = size === 'sm' ? t.iconSize.sm : t.iconSize.md;

  return (
    <Pressable
      testID={node}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hit}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [{ opacity: disabled ? t.opacity.disabled : pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          {
            width: box,
            height: box,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: t.radius.full,
            backgroundColor: bg,
          },
          shadow,
        ]}
      >
        <Icon name={icon} size={glyph} color={fg} />
      </View>
    </Pressable>
  );
}
