/**
 * MxSegmentedControl (WBS 1.7) — base class `segmented` (ADR 0004). A pill of
 * mutually-exclusive segments; the active one gets a raised surface. `block`
 * stretches to full width. Optional per-segment `icon`.
 */

import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export interface MxSegment {
  value: string;
  label: string;
  icon?: IconName | string;
}

export interface MxSegmentedControlProps {
  segments: MxSegment[];
  value: string;
  onChange?: (value: string) => void;
  block?: boolean;
  node?: string;
}

export function MxSegmentedControl({ segments, value, onChange, block = false, node }: MxSegmentedControlProps) {
  const t = useTheme();

  return (
    <View
      testID={node}
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        alignSelf: block ? 'stretch' : 'flex-start',
        padding: t.space[1],
        gap: t.space[1],
        borderRadius: t.radius.pill,
        backgroundColor: t.color.surfaceMuted,
      }}
    >
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            testID={node ? `${node}/${seg.value}` : undefined}
            onPress={() => onChange?.(seg.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={seg.label}
            style={[
              {
                flex: block ? 1 : undefined,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.space[1],
                minHeight: t.size.sm - t.space[2],
                paddingHorizontal: t.space[4],
                borderRadius: t.radius.pill,
                backgroundColor: active ? t.color.surface : 'transparent',
              },
              active && t.elevation.sm,
            ]}
          >
            {seg.icon !== undefined && (
              <Icon name={seg.icon} size={t.iconSize.sm} color={active ? t.color.text : t.color.textSecondary} />
            )}
            <Text
              style={[
                t.font.text({ size: 'sm', weight: active ? 'bold' : 'semibold' }),
                { color: active ? t.color.text : t.color.textSecondary },
              ]}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
