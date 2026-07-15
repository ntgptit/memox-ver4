/**
 * MxCard (WBS 1.5) — surface container. Base class `card` (ADR 0004).
 *
 * Variants map to token-driven styles; `interactive`/`onPress` make it a Pressable
 * with button semantics. Frozen prop names. `node` → `testID` (WBS 0.11).
 */

import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme, type Theme } from '../../theme';

export type MxCardVariant = 'elevated' | 'flat' | 'muted' | 'primary' | 'primary-soft';
export type MxCardPadding = 'sm' | 'md' | 'lg';

export interface MxCardProps {
  variant?: MxCardVariant;
  interactive?: boolean;
  padding?: MxCardPadding;
  onPress?: () => void;
  node?: string;
  accessibilityLabel?: string;
  /** Selection semantics for option-card usage (e.g. deck-content-choice radios). */
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function variantStyle(t: Theme, variant: MxCardVariant): ViewStyle {
  switch (variant) {
    case 'flat':
      return { backgroundColor: t.color.surface, borderWidth: t.stroke.hairline, borderColor: t.color.border };
    case 'muted':
      return { backgroundColor: t.color.surfaceMuted };
    case 'primary':
      return { backgroundColor: t.color.primary, ...t.elevation.fab };
    case 'primary-soft':
      return { backgroundColor: t.color.primarySoft };
    case 'elevated':
    default:
      return { backgroundColor: t.color.surface, ...t.elevation.card };
  }
}

export function MxCard({
  variant = 'elevated',
  interactive = false,
  padding = 'md',
  onPress,
  node,
  accessibilityLabel,
  accessibilityState,
  children,
  style,
}: MxCardProps) {
  const t = useTheme();
  const base: ViewStyle = {
    gap: t.space[3],
    padding: padding === 'sm' ? t.space[4] : t.space[6],
    borderRadius: t.radius.card,
  };
  const composed: StyleProp<ViewStyle> = [base, variantStyle(t, variant), style];
  const pressable = interactive || typeof onPress === 'function';

  if (pressable) {
    return (
      <Pressable
        testID={node}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        style={({ pressed }) => [composed, pressed && { transform: [{ scale: 0.985 }] }]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View testID={node} accessibilityLabel={accessibilityLabel} style={composed}>
      {children}
    </View>
  );
}
