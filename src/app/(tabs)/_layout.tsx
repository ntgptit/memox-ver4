import { Tabs } from 'expo-router';

// Root tab bar: Today / Library / Stats / Profile (destinations only; "Add" is a FAB, not a tab).
// Material Symbols tab icons + the MemoX bottom-nav visual arrive with WBS 1.6.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
