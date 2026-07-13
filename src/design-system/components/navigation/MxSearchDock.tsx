/**
 * MxSearchDock (WBS 1.6) — base class `search-dock` (ADR 0004). A pill-shaped search
 * field: leading search glyph, a text input, and an optional `trailing` slot.
 * `focused` shows a focus ring; `flat` drops the shadow (e.g. inside the app bar).
 */

import { TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import { Icon } from '../../icons';

export interface MxSearchDockProps {
  placeholder?: string;
  value?: string;
  onChange?: (text: string) => void;
  focused?: boolean;
  flat?: boolean;
  trailing?: ReactNode;
  accessibilityLabel?: string;
  node?: string;
}

export function MxSearchDock({
  placeholder = 'Search',
  value,
  onChange,
  focused = false,
  flat = false,
  trailing,
  accessibilityLabel,
  node,
}: MxSearchDockProps) {
  const t = useTheme();

  const container: StyleProp<ViewStyle> = [
    {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space[3],
      height: t.layout.touchMin,
      paddingHorizontal: t.space[4],
      backgroundColor: t.color.surface,
      borderRadius: t.radius.pill,
    },
    !flat && t.elevation.sm,
    focused && { borderWidth: t.stroke.emphasis, borderColor: t.color.focusRing },
  ];

  return (
    <View testID={node} style={container}>
      <Icon name="search" size={t.iconSize.md} color={t.color.textSecondary} />
      <TextInput
        style={[t.font.text({ size: 'base' }), { flex: 1, color: t.color.text, padding: 0 }]}
        placeholder={placeholder}
        placeholderTextColor={t.color.textSecondary}
        value={value}
        onChangeText={onChange}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        returnKeyType="search"
      />
      {trailing}
    </View>
  );
}
