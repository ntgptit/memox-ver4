/**
 * Dashboard (WBS 5.3) — accessibility gate (contract 11.3). Roles/labels for the
 * root-bar actions (bell dot included), the goal progressbar, deck rows, and AA
 * contrast of the Today-strip tints in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { DashboardScreen } from '../dashboard-screen';
import { DASHBOARD_FIXTURES, type DashboardFixtureKey } from '../dashboard-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: DashboardFixtureKey) {
  const f = DASHBOARD_FIXTURES[key];
  return renderScreen(<DashboardScreen data={f.data} initialUi={f.ui} />);
}

describe('DashboardScreen a11y — roles & labels', () => {
  it('root-bar actions are labelled (search, unread bell, avatar, FAB)', () => {
    renderState('loaded');
    expect(screen.getByLabelText('Search words')).toBeTruthy();
    expect(screen.getByLabelText('Notifications, unread')).toBeTruthy();
    expect(screen.getByLabelText('Linh Tran')).toBeTruthy();
    expect(screen.getByLabelText('Add')).toBeTruthy();
  });

  it('the greeting is a header; the goal bar is a progressbar with a value', () => {
    renderState('loaded');
    expect(screen.getByRole('header', { name: 'Good evening, Linh' })).toBeTruthy();
    const bar = screen.getByTestId('dashboard/goal-bar');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 70 });
  });

  it('deck rows are buttons labelled by their deck name', () => {
    const f = DASHBOARD_FIXTURES.loaded;
    renderScreen(<DashboardScreen data={f.data} initialUi={f.ui} onOpenDeck={() => {}} />);
    expect(screen.getByLabelText('TOPIK I — Vocabulary')).toBeTruthy();
  });

  it('deck progress bars announce their mastery percent', () => {
    renderState('loaded');
    expect(screen.getByLabelText('72% mastered')).toBeTruthy();
  });
});

describe('DashboardScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: notes and stat chips meet AA on their tints (over bg)`, () => {
      expect(meetsContrastAA(c.onPrimarySoft, c.primarySoft, { large: true, base: c.bg })).toBe(true);
      expect(meetsContrastAA(c.onSuccessSoft, c.successSoft, { large: true, base: c.bg })).toBe(true);
      expect(meetsContrastAA(c.onWarningSoft, c.warningSoft, { large: true, base: c.bg })).toBe(true);
      expect(meetsContrastAA(c.accent, c.accentSoft, { large: true, base: c.bg })).toBe(true);
    });
    it(`${scheme}: onboarding hero copy meets AA on primary`, () => {
      expect(meetsContrastAA(c.onPrimary, c.primary)).toBe(true);
    });
  }
});
