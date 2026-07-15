/**
 * Export (WBS 9.2) — accessibility gate (contract 11.3): labelled controls,
 * radio rows announce selection, a real progressbar with a value, and AA
 * contrast in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { ExportScreen } from '../export-screen';
import { EXPORT_FIXTURES, type ExportFixtureKey } from '../export-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: ExportFixtureKey) {
  const f = EXPORT_FIXTURES[key];
  return renderScreen(<ExportScreen ui={f.ui} data={f.data} onPickFormat={() => {}} />);
}

describe('ExportScreen a11y — roles & labels', () => {
  it('config controls are labelled and the selected format announces itself', () => {
    renderState('config');
    expect(screen.getByLabelText('Back')).toBeTruthy();
    expect(screen.getByLabelText('Include review state')).toBeTruthy();
    expect(screen.getByTestId('export/format-csv').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('export/format-xlsx').props.accessibilityState.selected).toBe(false);
  });

  it('exporting exposes a progressbar with the current value', () => {
    renderState('exporting');
    const bar = screen.getByTestId('export/bar');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 70 });
  });
});

describe('ExportScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: body text, secondary text and the success tile meet AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.textSecondary, c.surface)).toBe(true);
      expect(meetsContrastAA(c.onSuccessSoft, c.successSoft, { large: true, base: c.surface })).toBe(true);
    });
  }
});
