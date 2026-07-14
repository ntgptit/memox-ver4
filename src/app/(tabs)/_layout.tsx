import { Tabs, useGlobalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MxBottomNav, ThemeProvider, useTheme } from '@/design-system';
import type { MxBottomNavItem } from '@/design-system';

// Root tab bar: Today / Library / Stats / Profile (destinations only; "Add" is a FAB, not a tab).
// The MemoX bottom nav (WBS 1.6) replaces the default tab bar; routing between the placeholder
// tab screens is driven by the navigation state (WBS 2.1).
// Icons mirror the kit's Dashboard NAV fixture (today/style/insights/person).
const TAB_ITEMS: MxBottomNavItem[] = [
  { value: 'index', icon: 'today', label: 'Today' },
  { value: 'library', icon: 'style', label: 'Library' },
  { value: 'stats', icon: 'insights', label: 'Stats' },
  { value: 'profile', icon: 'person', label: 'Profile' },
];

interface TabBarProps {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { navigate: (name: string) => void };
}

function MemoxTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const current = state.routes[state.index]?.name ?? 'index';
  return (
    <View style={{ paddingBottom: insets.bottom, backgroundColor: t.color.surface }}>
      <MxBottomNav
        node="shell/bottom-nav"
        items={TAB_ITEMS}
        value={current}
        onChange={(value) => navigation.navigate(value)}
      />
    </View>
  );
}

export default function TabsLayout() {
  // Fixture previews (`?state=…&theme=dark`, the visual-golden harness) force the
  // scheme for the WHOLE tab shell — the bar must match the previewed screen.
  const { theme } = useGlobalSearchParams<{ theme?: string }>();

  const tabs = (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MemoxTabBar {...(props as unknown as TabBarProps)} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
  return theme === 'dark' ? <ThemeProvider initialMode="dark">{tabs}</ThemeProvider> : tabs;
}
