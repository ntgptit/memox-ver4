import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { useTheme } from '@/design-system';

export default function NotFoundScreen() {
  const t = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.space[3],
          padding: t.space[6],
          backgroundColor: t.color.bg,
        }}
      >
        <Text style={[t.font.text({ size: 'md', weight: 'semibold' }), { color: t.color.text }]}>
          This screen does not exist.
        </Text>
        <Link href="/" style={[t.font.text({ size: 'base' }), { color: t.color.primary }]}>
          Go to Today
        </Link>
      </View>
    </>
  );
}
