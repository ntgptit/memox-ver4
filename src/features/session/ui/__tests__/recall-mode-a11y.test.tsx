/**
 * Recall-mode (WBS 7.1) — accessibility gate (contract 11.3). Progress + meaning-panel
 * roles/labels, labelled controls, and AA contrast (incl. the feedback notes) in both
 * schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { RecallModeScreen, type RecallModeScreenProps } from '../recall-mode-screen';
import { RECALL_FIXTURES, type RecallFixtureKey } from '../recall-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(key: RecallFixtureKey, over: Partial<RecallModeScreenProps> = {}): RecallModeScreenProps {
  return {
    ...RECALL_FIXTURES[key],
    onReveal: jest.fn(),
    onForgot: jest.fn(),
    onRemembered: jest.fn(),
    ...over,
  };
}

describe('RecallModeScreen a11y — roles & labels', () => {
  it('the back control is labelled', () => {
    renderScreen(<RecallModeScreen {...props('before-reveal', { onBack: () => {} })} />);
    expect(screen.getByLabelText('Back')).toBeTruthy();
  });

  it('progress is announced with its value', () => {
    renderScreen(<RecallModeScreen {...props('before-reveal')} />);
    const bar = screen.getByTestId('recall-mode/progress');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toMatchObject({ now: 12, max: 20 });
  });

  it('the meaning panel announces hidden vs revealed', () => {
    const { rerender } = renderScreen(<RecallModeScreen {...props('before-reveal')} />);
    expect(screen.getByLabelText('Meaning hidden')).toBeTruthy();
    rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <ThemeProvider>
          <RecallModeScreen {...props('revealed')} />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(screen.getByLabelText('Meaning: friend')).toBeTruthy();
  });
});

describe('RecallModeScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: prompt term on surface meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
    });
    it(`${scheme}: the warning feedback icon meets AA-large on surface`, () => {
      expect(meetsContrastAA(c.warning, c.surface, { large: true })).toBe(true);
    });
    it(`${scheme}: the success feedback icon meets AA-large on surface`, () => {
      expect(meetsContrastAA(c.success, c.surface, { large: true })).toBe(true);
    });
  }
});
