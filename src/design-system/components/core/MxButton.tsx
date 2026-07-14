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
export type MxButtonSize = 'lg' | 'md' | 'sm';

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

function palette(
  t: Theme,
  variant: MxButtonVariant,
  danger: boolean,
): { bg: string; fg: string; border?: string; borderWidth?: number } {
  // Kit `.btn.danger` is a composed modifier: solid error fill for ANY variant,
  // ring removed (components.css .btn.danger). So danger always wins over variant.
  if (danger) return { bg: t.color.error, fg: t.color.onError };
  switch (variant) {
    case 'primary':
      return { bg: t.color.primary, fg: t.color.onPrimary };
    case 'secondary':
      return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft };
    case 'outline':
      // Kit: text colour, stroke-mid inset ring in border-strong.
      return { bg: 'transparent', fg: t.color.text, border: t.color.borderStrong, borderWidth: t.stroke.mid };
    case 'ghost':
    default:
      // Kit: bright accent label + hairline border so it reads as a real button on
      // any surface (transparent fill alone is near-invisible on dark).
      return { bg: 'transparent', fg: t.color.accent, border: t.color.border, borderWidth: t.stroke.hairline };
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
  const { bg, fg, border, borderWidth } = palette(t, variant, danger);
  // Kit sizes: sm = size-sm (40)/pad-4, md = touch-min (48)/pad-6, lg = size-md (56)/pad-7.
  const minHeight = size === 'sm' ? t.size.sm : size === 'lg' ? t.size.md : t.layout.touchMin;
  const padX = size === 'sm' ? t.space[4] : size === 'lg' ? t.space[7] : t.space[6];
  const labelSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'base';

  const container: StyleProp<ViewStyle> = {
    minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: block ? 'stretch' : 'flex-start',
    gap: t.space[2],
    paddingHorizontal: padX,
    borderRadius: t.radius.control,
    backgroundColor: bg,
    borderWidth: border ? borderWidth ?? t.stroke.hairline : 0,
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
      <Text style={[t.font.text({ size: labelSize, weight: 'bold' }), { color: fg }]}>{children}</Text>
      {trailingIcon !== undefined && (
        <View>
          <Icon name={trailingIcon} size={t.iconSize.md} color={fg} />
        </View>
      )}
    </Pressable>
  );
}
