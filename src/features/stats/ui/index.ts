/** Statistics slice (WBS 8.1) — public surface. */

export { StatisticsScreen, type StatisticsScreenProps } from './statistics-screen';
export { StatisticsContainer } from './statistics-container';
export {
  useStatistics,
  deriveStreaks,
  deriveHeatmap,
  deriveLeitner,
  dayKey,
  MIN_ATTEMPTS,
  type StatisticsDeps,
  type StatisticsController,
} from './use-statistics';
export {
  STATISTICS_FIXTURES,
  STATISTICS_VIEW,
  type StatisticsData,
  type StatisticsView,
  type StatisticsFixture,
  type StatisticsFixtureKey,
  type StatisticsUiState,
  type StatsScope,
} from './statistics-fixtures';
export { Bars, Heatmap, Donut } from './statistics-components';
