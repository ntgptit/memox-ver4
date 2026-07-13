import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MxBottomNav, useTheme } from '@/design-system';
import type { MxBottomNavItem } from '@/design-system';

// Root tab bar: Today / Library / Stats / Profile (destinations only; "Add" is a FAB, not a tab).
// The MemoX bottom nav (WBS 1.6) replaces the default tab bar; routing between the placeholder
// tab screens is driven by the navigation state (WBS 2.1).
const TAB_ITEMS: MxBottomNavItem[] = [
  { value: 'index', icon: 'home', label: 'Today' },
  { value: 'library', icon: 'library_music', label: 'Library' },
  { value: 'stats', icon: 'bar_chart', label: 'Stats' },
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
  return (
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
}
