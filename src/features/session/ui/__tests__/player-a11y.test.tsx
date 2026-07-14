/**
 * Player (WBS 7.3) — accessibility gate (contract 11.3). Labelled transport
 * (≥48px targets by construction: icon buttons + FAB), labelled bar actions,
 * and AA contrast of the card text in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { PlayerScreen } from '../player-screen';
import { PLAYER_FIXTURES, type PlayerFixtureKey } from '../player-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: PlayerFixtureKey) {
  const f = PLAYER_FIXTURES[key];
  return renderScreen(<PlayerScreen data={f.data} ui={f.ui} />);
}

describe('PlayerScreen a11y — roles & labels', () => {
  it('the transport is fully labelled', () => {
    renderState('playing');
    expect(screen.getByLabelText('Previous card')).toBeTruthy();
    expect(screen.getByLabelText('Pause')).toBeTruthy();
    expect(screen.getByLabelText('Next card')).toBeTruthy();
  });

  it('bar actions are labelled', () => {
    renderState('playing');
    expect(screen.getByLabelText('Back')).toBeTruthy();
    expect(screen.getByLabelText('Options')).toBeTruthy();
  });

  it('paused announces Play', () => {
    renderState('paused');
    expect(screen.getByLabelText('Play')).toBeTruthy();
  });
});

describe('PlayerScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: card text meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.onPrimary, c.primary, { large: true })).toBe(true);
    });
  }
});
