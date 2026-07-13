import { StyleSheet, Text, View } from 'react-native';

/**
 * Temporary route placeholder. Every route created by WBS 0.2 renders this until its feature
 * slice replaces it with the real screen. Not a design-system primitive — removed as screens land.
 */
export function RoutePlaceholder({ title, wbs }: { title: string; wbs: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>WBS {wbs} — screen not implemented yet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontSize: 20, fontWeight: '700' },
  sub: { fontSize: 13, opacity: 0.6 },
});
