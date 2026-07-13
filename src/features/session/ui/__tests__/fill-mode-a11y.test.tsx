/**
 * Fill-mode (WBS 7.2) — accessibility gate (contract 11.3). Labelled input + controls,
 * a char-compare that spells out the answer for screen readers, progressbar, and AA
 * contrast in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { FillModeScreen, type FillModeScreenProps } from '../fill-mode-screen';
import { FILL_FIXTURES, type FillFixtureKey } from '../fill-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(key: FillFixtureKey, over: Partial<FillModeScreenProps> = {}): FillModeScreenProps {
  return {
    ...FILL_FIXTURES[key],
    onChangeInput: jest.fn(),
    onCheck: jest.fn(),
    onHint: jest.fn(),
    onNext: jest.fn(),
    onAccept: jest.fn(),
    onRetry: jest.fn(),
    ...over,
  };
}

describe('FillModeScreen a11y — roles & labels', () => {
  it('back + progress + input are labelled', () => {
    renderScreen(<FillModeScreen {...props('typing', { onBack: () => {} })} />);
    expect(screen.getByLabelText('Back')).toBeTruthy();
    expect(screen.getByLabelText('Type the term')).toBeTruthy();
    const bar = screen.getByTestId('fill-mode/progress');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toMatchObject({ now: 16, max: 20 });
  });

  it('the char-compare spells out typed vs correct for screen readers', () => {
    renderScreen(<FillModeScreen {...props('wrong')} />);
    expect(screen.getByLabelText('You typed 친고. Correct answer 친구.')).toBeTruthy();
  });
});

describe('FillModeScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: meaning + input text on surface meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
    });
    it(`${scheme}: the correct char + answer green meets AA-large on surface`, () => {
      expect(meetsContrastAA(c.success, c.surface, { large: true })).toBe(true);
    });
    it(`${scheme}: the wrong char red meets AA-large on surface`, () => {
      expect(meetsContrastAA(c.error, c.surface, { large: true })).toBe(true);
    });
  }
});
