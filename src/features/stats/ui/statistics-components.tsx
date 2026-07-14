/**
 * Statistics feature-local components (WBS 8.1) — RN ports of the kit's
 * `_features/statistics/components/*`: Bars (labelled vertical bar chart used
 * by weekly minutes + Leitner distribution), Heatmap (14-week study calendar)
 * and Donut (accuracy ring over the shared Ring composite).
 */

import { Text, View } from 'react-native';

import { Ring, useTheme } from '@/design-system';

/** Kit Bars: axis-labelled columns scaled to the max value. */
export function Bars({ data, labels, tone }: { data: readonly number[]; labels: readonly string[]; tone?: string }) {
  const t = useTheme();
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: t.space[2], height: t.size['2xl'] }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: t.space[1], height: '100%', justifyContent: 'flex-end' }}>
          <View
            style={{
              width: '100%',
              height: `${(v / max) * 100}%`,
              backgroundColor: tone ?? t.color.primary,
              borderRadius: t.radius.xs,
              minHeight: t.size['3xs'],
            }}
          />
          <Text style={[t.font.text({ size: 'xs' }), { color: t.color.textTertiary }]}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}

/** Kit Heatmap: 14 week columns × 7 day cells at the given intensities. */
export function Heatmap({ weeks }: { weeks: readonly (readonly number[])[] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: t.space[1] }}>
      {weeks.map((days, w) => (
        <View key={w} style={{ gap: t.space[1] }}>
          {days.map((op, d) => (
            <View
              key={d}
              style={{
                width: t.size.xs,
                height: t.size.xs,
                borderRadius: t.radius.xs,
                backgroundColor: t.color.primary,
                opacity: op,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Kit Donut: the success-toned accuracy ring (size-2xl, space-4 inset). */
export function Donut({ pct }: { pct: number }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: t.space[1] }}>
      <Ring pct={pct} size={t.size['2xl']} tone={t.color.success} inset={t.space[4]} accessibilityLabel={`${pct}% accuracy`} node="statistics/accuracy-ring">
        <Text style={[t.font.text({ size: 'xl', weight: 'extrabold' }), { color: t.color.text }]}>{pct}%</Text>
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>accuracy</Text>
      </Ring>
    </View>
  );
}
