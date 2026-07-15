/**
 * Settings (WBS 10.1) — accessibility gate (contract 11.3): labelled switches
 * and rows, picker options announce selection, and AA contrast in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { SettingsScreen } from '../settings-screen';
import { SETTINGS_FIXTURES, type SettingsFixtureKey } from '../settings-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: SettingsFixtureKey) {
  const f = SETTINGS_FIXTURES[key];
  return renderScreen(<SettingsScreen ui={f.ui} settings={f.settings} onOpen={() => {}} onOpenStudy={() => {}} />);
}

describe('SettingsScreen a11y — roles & labels', () => {
  it('root rows are labelled buttons', () => {
    renderState('loaded');
    expect(screen.getByLabelText('Study settings')).toBeTruthy();
    expect(screen.getByLabelText('Export cards')).toBeTruthy();
  });

  it('child switches carry their setting label + checked state', () => {
    renderState('study-voice');
    const tts = screen.getByLabelText('Text-to-speech');
    expect(tts.props.accessibilityState.checked).toBe(true);
  });

  it('picker options announce their selected state', () => {
    renderState('value-picker');
    expect(screen.getByTestId('settings/words-5').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('settings/words-20').props.accessibilityState.selected).toBe(false);
  });
});

describe('SettingsScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: row text and secondary sub text meet AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.textSecondary, c.surface)).toBe(true);
    });
  }
});
