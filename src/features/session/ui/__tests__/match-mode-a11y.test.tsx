/**
 * Match-mode (WBS 6.2) — accessibility gate (contract 11.3). Tiles announce their
 * selected/matched/no-match state in text (not colour alone), matched tiles announce
 * disabled, progress + back are labelled, and the tones meet AA in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { MatchModeScreen, type MatchModeScreenProps } from '../match-mode-screen';
import { MATCH_FIXTURES, type MatchFixtureKey } from '../match-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(key: MatchFixtureKey, over: Partial<MatchModeScreenProps> = {}): MatchModeScreenProps {
  return { ...MATCH_FIXTURES[key], onTap: jest.fn(), ...over };
}

describe('MatchModeScreen a11y — roles & labels', () => {
  it('back + progress are labelled', () => {
    renderScreen(<MatchModeScreen {...props('playing', { onBack: () => {} })} />);
    expect(screen.getByLabelText('Back')).toBeTruthy();
    const bar = screen.getByTestId('match-mode/progress');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toMatchObject({ now: 0, max: 5 });
  });

  it('tile state is conveyed in the label, not colour alone', () => {
    renderScreen(<MatchModeScreen {...props('wrong')} />);
    expect(screen.getByLabelText('love (no match)')).toBeTruthy();
  });

  it('matched tiles announce disabled', () => {
    renderScreen(<MatchModeScreen {...props('almost')} />);
    expect(screen.getByTestId('match-mode/left-0').props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe('MatchModeScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: tile text on surface meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
    });
    it(`${scheme}: a selected tile's text meets AA on its soft fill`, () => {
      expect(meetsContrastAA(c.onPrimarySoft, c.primarySoft)).toBe(true);
    });
    it(`${scheme}: the matched/correct border meets AA-large on surface`, () => {
      expect(meetsContrastAA(c.success, c.surface, { large: true })).toBe(true);
    });
  }
});
