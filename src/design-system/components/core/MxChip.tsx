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
  if (selected) {
    return variant === 'accent'
      ? { bg: t.color.accent, fg: t.color.onAccent, border: 'transparent' }
      : { bg: t.color.primary, fg: t.color.onPrimary, border: 'transparent' };
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
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space[2],
          height: t.size.sm - t.space[2], // ~32
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
