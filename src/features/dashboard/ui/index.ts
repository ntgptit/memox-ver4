/** Dashboard slice (WBS 5.3) — public surface. */

export { DashboardScreen, type DashboardScreenProps } from './dashboard-screen';
export { DashboardContainer, type DashboardContainerProps } from './dashboard-container';
export {
  useDashboard,
  deriveStreak,
  greetingForHour,
  dayKey,
  DAILY_GOAL_MINUTES,
  type DashboardController,
  type DashboardDeps,
} from './use-dashboard';
export {
  DASHBOARD_DECKS,
  DASHBOARD_CAUGHT_DECKS,
  DASHBOARD_STATS,
  DASHBOARD_FIXTURES,
  type DashboardData,
  type DashboardDeckView,
  type DashboardStats,
  type DashboardFixture,
  type DashboardFixtureKey,
  type DashboardUiState,
} from './dashboard-fixtures';
export { GreetingHeader, GoalCard, OnboardingHero, OnboardingStep, Stat } from './dashboard-components';
