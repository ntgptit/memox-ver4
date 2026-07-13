/**
 * MxBottomNav (WBS 1.6) — base class `bottom-nav` (ADR 0004). The bottom navigation
 * bar: destinations spaced across an 80px surface bar; the active item's icon gets a
 * primary-soft pill. `value` selects the active item; `onChange` fires its value.
 */

import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Icon, type IconName } from '../../icons';

export interface MxBottomNavItem {
  value: string;
  icon: IconName | string;
  label: string;
}

export interface MxBottomNavProps {
  items: MxBottomNavItem[];
  value: string;
  onChange?: (value: string) => void;
  node?: string;
}

export function MxBottomNav({ items, value, onChange, node }: MxBottomNavProps) {
  const t = useTheme();

  return (
    <View
      testID={node}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'space-around',
          height: t.layout.bottomNavHeight,
          paddingVertical: t.space[2],
          paddingHorizontal: t.space[2],
          backgroundColor: t.color.surface,
        },
        t.elevation.nav,
      ]}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Pressable
            key={item.value}
            testID={node ? `${node}/${item.value}` : undefined}
            onPress={() => onChange?.(item.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={{ flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: t.space[1] }}
          >
            <View
              style={{
                paddingHorizontal: t.space[4],
                paddingVertical: t.space[1],
                borderRadius: t.radius.pill,
                backgroundColor: active ? t.color.primarySoft : 'transparent',
              }}
            >
              <Icon
                name={item.icon}
                size={t.iconSize.md}
                color={active ? t.color.onPrimarySoft : t.color.textSecondary}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[
                t.font.text({ size: 'xs', weight: active ? 'bold' : 'semibold' }),
                { color: active ? t.color.text : t.color.textSecondary },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
