/**
 * Import (WBS 9.1) — accessibility gate (contract 11.3): labelled controls,
 * a real progressbar role with a value, and AA contrast for the tinted
 * dup-warning callout and table text in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { ImportScreen } from '../import-screen';
import { IMPORT_FIXTURES, type ImportFixtureKey } from '../import-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: ImportFixtureKey) {
  const f = IMPORT_FIXTURES[key];
  return renderScreen(<ImportScreen ui={f.ui} data={f.data} />);
}

describe('ImportScreen a11y — roles & labels', () => {
  it('source controls are labelled', () => {
    renderState('source');
    expect(screen.getByLabelText('Back')).toBeTruthy();
    expect(screen.getByLabelText('CSV file')).toBeTruthy();
    expect(screen.getByLabelText('Paste text')).toBeTruthy();
    expect(screen.getByLabelText('Paste your data')).toBeTruthy();
  });

  it('mapping pickers are labelled', () => {
    renderState('mapping');
    expect(screen.getByLabelText('Pick term column')).toBeTruthy();
    expect(screen.getByLabelText('Pick meaning column')).toBeTruthy();
  });

  it('importing exposes a progressbar with the current value', () => {
    renderState('importing');
    const bar = screen.getByTestId('import/importing-bar');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 62 });
  });
});

describe('ImportScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: body text, secondary table text and the warning callout meet AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.textSecondary, c.bg)).toBe(true);
      expect(meetsContrastAA(c.onWarningSoft, c.warningSoft, { large: true, base: c.surface })).toBe(true);
    });
  }
});
