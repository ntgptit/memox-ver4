/**
 * MxChip (WBS 1.7) — base class `chip` (ADR 0004). A compact pill filter/tag.
 * `variant` accent/ghost; `selected` fills it. Optional leading `icon`.
 */

import { Pressable, Text, View } from 'react-native';

import { useTheme, type Theme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export type MxChipVariant = 'ghost' | 'accent';

export interface MxChipProps {
  label: string;
  icon?: IconName | string;
  selected?: boolean;
  variant?: MxChipVariant;
  onPress?: () => void;
  node?: string;
}

function chipColors(t: Theme, variant: MxChipVariant, selected: boolean): { bg: string; fg: string; border: string } {
  // Kit: `.chip--accent` is a SOFT accent tint with the bright accent glyph (on-accent
  // is meant only for a solid fill), and `.chip--selected` is the primary-soft tint —
  // selection is a tint, never a solid brand fill (components.css .chip--selected).
  if (variant === 'accent') {
    return { bg: t.color.accentSoft, fg: t.color.accent, border: 'transparent' };
  }
  if (selected) {
    return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft, border: 'transparent' };
  }
  return { bg: t.color.surface, fg: t.color.textSecondary, border: t.color.border };
}

export function MxChip({ label, icon, selected = false, variant = 'ghost', onPress, node }: MxChipProps) {
  const t = useTheme();
  const { bg, fg, border } = chipColors(t, variant, selected);

  return (
    <Pressable
      testID={node}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      hitSlop={(t.layout.touchMin - t.comp.chipHeight) / 2}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space[2],
          height: t.comp.chipHeight,
          paddingHorizontal: t.space[4],
          borderRadius: t.radius.chip,
          backgroundColor: bg,
          borderWidth: t.stroke.hairline,
          borderColor: border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {icon !== undefined && (
        <View>
          <Icon name={icon} size={t.iconSize.sm} color={fg} />
        </View>
      )}
      <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: fg }]}>{label}</Text>
    </Pressable>
  );
}
