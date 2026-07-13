/**
 * Guess-mode (WBS 6.3) — accessibility gate (contract 11.3). Labelled options that
 * announce correct/wrong via text (not colour alone), progress + back labels, and AA
 * contrast for the feedback tones in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { GuessModeScreen, type GuessModeScreenProps } from '../guess-mode-screen';
import { GUESS_FIXTURES, type GuessFixtureKey } from '../guess-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(key: GuessFixtureKey, over: Partial<GuessModeScreenProps> = {}): GuessModeScreenProps {
  return { ...GUESS_FIXTURES[key], onPick: jest.fn(), onContinue: jest.fn(), ...over };
}

describe('GuessModeScreen a11y — roles & labels', () => {
  it('back + progress are labelled', () => {
    renderScreen(<GuessModeScreen {...props('waiting', { onBack: () => {} })} />);
    expect(screen.getByLabelText('Back')).toBeTruthy();
    const bar = screen.getByTestId('guess-mode/progress');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toMatchObject({ now: 8, max: 20 });
  });

  it('feedback is conveyed in the label text, not colour alone', () => {
    renderScreen(<GuessModeScreen {...props('wrong')} />);
    expect(screen.getByLabelText('school (correct)')).toBeTruthy();
    expect(screen.getByLabelText('park (your answer, wrong)')).toBeTruthy();
  });

  it('options announce disabled after feedback', () => {
    renderScreen(<GuessModeScreen {...props('correct')} />);
    expect(screen.getByTestId('guess-mode/choice-1').props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe('GuessModeScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: option text on surface meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
    });
    it(`${scheme}: the correct border/icon meets AA-large on surface`, () => {
      expect(meetsContrastAA(c.success, c.surface, { large: true })).toBe(true);
    });
    it(`${scheme}: the wrong border/icon meets AA-large on surface`, () => {
      expect(meetsContrastAA(c.error, c.surface, { large: true })).toBe(true);
    });
  }
});
