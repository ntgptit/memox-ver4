/**
 * Statistics screen (WBS 8.1) — the Stats tab. Composition mirrors the kit
 * `_features/statistics/Statistics.jsx`: root "Stats" bar → This-pair/All
 * scope segments → streak pair cards → Study calendar heatmap → Time-per-week
 * bars → Leitner-box bars (accent) → accuracy Donut → Library overview stat
 * trio; plus insufficient / loading / error. 5 states (contract §6). The
 * bottom nav is the real tab bar (`(tabs)/_layout`) — `inTabs`.
 */

import { View } from 'react-native';

import {
  AppScreen,
  EmptyState,
  MxButton,
  MxCard,
  MxSectionHeader,
  MxSegmentedControl,
  Skeleton,
  Stat,
  useTheme,
} from '@/design-system';

import { Bars, Donut, Heatmap } from './statistics-components';
import type { StatisticsData, StatsScope } from './statistics-fixtures';

export interface StatisticsScreenProps {
  data: StatisticsData;
  scope?: StatsScope;
  onScopeChange?: (scope: StatsScope) => void;
  onRetry?: () => void;
}

export function StatisticsScreen({ data, scope = 'pair', onScopeChange, onRetry }: StatisticsScreenProps) {
  const t = useTheme();

  const scopeControl = (
    <MxSegmentedControl
      value={scope}
      onChange={(v) => onScopeChange?.(v as StatsScope)}
      block
      node="statistics/scope"
      segments={[
        { value: 'pair', label: 'This pair' },
        { value: 'all', label: 'All' },
      ]}
    />
  );

  // ---- loading ------------------------------------------------------------------
  if (data.status === 'loading') {
    return (
      <AppScreen node="statistics/screen" inTabs title="Stats">
        <Skeleton h={40} r={999} />
        {[0, 1, 2].map((i) => (
          <MxCard key={i}>
            <Skeleton w="45%" h={14} />
            <Skeleton h={110} r={12} style={{ marginTop: t.space[3] }} />
          </MxCard>
        ))}
      </AppScreen>
    );
  }

  // ---- insufficient ----------------------------------------------------------------
  if (data.status === 'insufficient') {
    return (
      <AppScreen node="statistics/screen" inTabs title="Stats">
        {scopeControl}
        <EmptyState
          node="statistics/insufficient"
          icon="bar_chart"
          title="Not enough data"
          text="Study a few more sessions and MemoX will chart your progress, streaks and due forecast."
        />
      </AppScreen>
    );
  }

  // ---- error ----------------------------------------------------------------------
  if (data.status === 'error') {
    return (
      <AppScreen node="statistics/screen" inTabs title="Stats">
        {scopeControl}
        <EmptyState
          node="statistics/error"
          icon="bar_chart"
          tone="error"
          title="Couldn't load stats"
          text={data.message}
          action={
            <MxButton variant="primary" icon="refresh" onPress={onRetry} node="statistics/retry">
              Try again
            </MxButton>
          }
        />
      </AppScreen>
    );
  }

  const v = data.view;
  return (
    <AppScreen node="statistics/screen" inTabs title="Stats">
      {scopeControl}

      <View style={{ flexDirection: 'row', gap: t.space[3] }}>
        <MxCard variant="primary-soft" padding="sm" node="statistics/streak-current" style={{ flex: 1, alignItems: 'center' }}>
          <Stat n={String(v.currentStreak)} l="current streak" />
        </MxCard>
        <MxCard variant="muted" padding="sm" node="statistics/streak-longest" style={{ flex: 1, alignItems: 'center' }}>
          <Stat n={String(v.longestStreak)} l="longest" />
        </MxCard>
      </View>

      <View testID="statistics/heatmap" style={{ gap: t.space[3] }}>
        <MxSectionHeader title="Study calendar" caption="last 14 weeks" node="statistics/heatmap-head" />
        <MxCard>
          <Heatmap weeks={v.heatmap} />
        </MxCard>
      </View>

      <View testID="statistics/weekly" style={{ gap: t.space[3] }}>
        <MxSectionHeader title="Time per week" caption="min / day" node="statistics/weekly-head" />
        <MxCard>
          <Bars data={v.weeklyMinutes} labels={v.weeklyLabels} />
        </MxCard>
      </View>

      <View testID="statistics/leitner" style={{ gap: t.space[3] }}>
        <MxSectionHeader title="Leitner box distribution" caption="cards in boxes 1–8" node="statistics/leitner-head" />
        <MxCard>
          <Bars data={v.leitner} labels={v.leitnerLabels} tone={t.color.accent} />
        </MxCard>
      </View>

      <View testID="statistics/accuracy" style={{ gap: t.space[3] }}>
        <MxSectionHeader title="Accuracy" caption="30 days" node="statistics/accuracy-head" />
        <MxCard>
          <Donut pct={v.accuracyPct} />
        </MxCard>
      </View>

      <View testID="statistics/overview" style={{ gap: t.space[3] }}>
        <MxSectionHeader title="Library overview" node="statistics/overview-head" />
        <View style={{ flexDirection: 'row', gap: t.space[3] }}>
          {(
            [
              [String(v.totalCards), 'total'],
              [String(v.masteredCards), 'mastered'],
              [String(v.dueCards), 'due'],
            ] as const
          ).map(([n, l], i) => (
            <MxCard key={l} variant="muted" padding="sm" node={`statistics/ov-${i}`} style={{ flex: 1, alignItems: 'center' }}>
              <Stat n={n} l={l} />
            </MxCard>
          ))}
        </View>
      </View>
    </AppScreen>
  );
}
