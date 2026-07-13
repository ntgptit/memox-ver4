/**
 * MxButton (WBS 1.7) — base class `btn` (ADR 0004). `variant`
 * primary/secondary/outline/ghost; `danger` swaps to the error family; `block`
 * stretches; `icon`/`trailingIcon`; `size` sm. ≥48px min height. `node` → `testID`.
 */

import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme, type Theme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export type MxButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type MxButtonSize = 'md' | 'sm';

export interface MxButtonProps {
  children?: ReactNode;
  variant?: MxButtonVariant;
  size?: MxButtonSize;
  block?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon?: IconName | string;
  trailingIcon?: IconName | string;
  onPress?: () => void;
  accessibilityLabel?: string;
  node?: string;
}

function palette(t: Theme, variant: MxButtonVariant, danger: boolean): { bg: string; fg: string; border?: string } {
  const solid = danger ? { bg: t.color.error, fg: t.color.onError } : { bg: t.color.primary, fg: t.color.onPrimary };
  const accentFg = danger ? t.color.error : t.color.primaryStrong;
  switch (variant) {
    case 'primary':
      return solid;
    case 'secondary':
      return { bg: t.color.primarySoft, fg: danger ? t.color.error : t.color.onPrimarySoft };
    case 'outline':
      return { bg: 'transparent', fg: accentFg, border: danger ? t.color.error : t.color.borderStrong };
    case 'ghost':
    default:
      return { bg: 'transparent', fg: accentFg };
  }
}

export function MxButton({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  danger = false,
  disabled = false,
  icon,
  trailingIcon,
  onPress,
  accessibilityLabel,
  node,
}: MxButtonProps) {
  const t = useTheme();
  const { bg, fg, border } = palette(t, variant, danger);
  const minHeight = size === 'sm' ? t.size.sm : t.layout.touchMin;

  const container: StyleProp<ViewStyle> = {
    minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: block ? 'stretch' : 'flex-start',
    gap: t.space[2],
    paddingHorizontal: t.space[6],
    borderRadius: t.radius.control,
    backgroundColor: bg,
    borderWidth: border ? t.stroke.hairline : 0,
    borderColor: border,
  };

  return (
    <Pressable
      testID={node}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [container, { opacity: disabled ? t.opacity.disabled : pressed ? 0.85 : 1 }]}
    >
      {icon !== undefined && (
        <View>
          <Icon name={icon} size={t.iconSize.md} color={fg} />
        </View>
      )}
      <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: fg }]}>{children}</Text>
      {trailingIcon !== undefined && (
        <View>
          <Icon name={trailingIcon} size={t.iconSize.md} color={fg} />
        </View>
      )}
    </Pressable>
  );
}
