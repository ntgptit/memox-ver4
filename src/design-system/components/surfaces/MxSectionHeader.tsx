/**
 * MxSectionHeader (WBS 1.5) — base class `section-head` (ADR 0004). A row with a
 * title (+ optional caption) on the left and an optional action link on the right.
 */

import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme';

export interface MxSectionHeaderProps {
  title: string;
  caption?: string;
  /** Whether to render the trailing action link. */
  action?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  node?: string;
}

export function MxSectionHeader({
  title,
  caption,
  action = false,
  actionLabel,
  onAction,
  node,
}: MxSectionHeaderProps) {
  const t = useTheme();
  return (
    <View
      testID={node}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.space[3] }}
    >
      <View style={{ flexShrink: 1 }}>
        <Text style={[t.font.text({ size: 'md', weight: 'semibold' }), { color: t.color.text }]}>{title}</Text>
        {caption !== undefined && (
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>{caption}</Text>
        )}
      </View>
      {action && actionLabel !== undefined && (
        <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={8}>
          <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.primaryStrong }]}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
