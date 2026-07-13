/**
 * Mode-picker (WBS 5.4) — accessibility gate (contract 11.3). Roles + labels on the
 * scope card, mode cards, scope-sheet radios and the guard, plus AA contrast in both
 * schemes for the screen's colour pairings.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { ModePickerScreen, type ModePickerScreenProps } from '../mode-picker-screen';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(over: Partial<ModePickerScreenProps> = {}): ModePickerScreenProps {
  return { scope: 'srs', scopeCount: 24, onScopeChange: jest.fn(), onStart: jest.fn(), ...over };
}

describe('ModePickerScreen a11y — roles & labels', () => {
  it('the back control is a labelled button', () => {
    renderScreen(<ModePickerScreen {...props({ onBack: () => {} })} />);
    expect(screen.getByLabelText('Back')).toBeTruthy();
  });

  it('the scope card summarises source + count for screen readers', () => {
    renderScreen(<ModePickerScreen {...props()} />);
    expect(screen.getByLabelText('Card source: By schedule, 24 words. Change')).toBeTruthy();
  });

  it('each mode exposes a descriptive label', () => {
    renderScreen(<ModePickerScreen {...props()} />);
    expect(screen.getByLabelText('Review. Browse and flip cards')).toBeTruthy();
    expect(screen.getByLabelText('Fill. Type the term from its meaning')).toBeTruthy();
  });

  it('scope-sheet options are radios that announce selection', () => {
    renderScreen(<ModePickerScreen {...props({ initialSheetOpen: true })} />);
    const selected = screen.getByTestId('mode-picker/scope-srs');
    expect(selected.props.accessibilityState).toMatchObject({ checked: true });
    const other = screen.getByTestId('mode-picker/scope-all');
    expect(other.props.accessibilityState).toMatchObject({ checked: false });
  });

  it('the not-enough guard is announced as an alert', () => {
    renderScreen(<ModePickerScreen {...props({ scopeCount: 1 })} />);
    expect(screen.getByTestId('mode-picker/not-enough').props.accessibilityRole).toBe('alert');
  });
});

describe('ModePickerScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: mode title on surface meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
    });
    it(`${scheme}: mode description on surface meets AA`, () => {
      expect(meetsContrastAA(c.textSecondary, c.surface)).toBe(true);
    });
    it(`${scheme}: selected scope row meets AA on its soft highlight`, () => {
      expect(meetsContrastAA(c.onPrimarySoft, c.primarySoft)).toBe(true);
    });
    it(`${scheme}: sheet text meets AA on the raised sheet`, () => {
      expect(meetsContrastAA(c.text, c.surfaceRaised)).toBe(true);
    });
  }
});
