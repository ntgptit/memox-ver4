/**
 * Export screen (WBS 9.2) — the 4-state matrix renders the kit copy verbatim
 * and every control fires its callback (scope segments, format radios,
 * separator chips, SRS switch, export/retry/share/save).
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/design-system';

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

function renderState(key: ExportFixtureKey, props: Partial<React.ComponentProps<typeof ExportScreen>> = {}) {
  const f = EXPORT_FIXTURES[key];
  return renderScreen(<ExportScreen ui={f.ui} data={f.data} {...props} />);
}

describe('ExportScreen — state matrix', () => {
  it('config: scope, formats, separators, SRS row and CTA', () => {
    renderState('config');
    expect(screen.getByText('SCOPE')).toBeTruthy();
    expect(screen.getByText('This deck')).toBeTruthy();
    expect(screen.getByText('Incl. sub-decks')).toBeTruthy();
    expect(screen.getByText('CSV')).toBeTruthy();
    expect(screen.getByText('Excel')).toBeTruthy();
    expect(screen.getByText('Copy text')).toBeTruthy();
    expect(screen.getByText('Tab')).toBeTruthy();
    expect(screen.getByText('Include review state')).toBeTruthy();
    expect(screen.getByText('Leitner box + due date')).toBeTruthy();
    expect(screen.getByText('Export')).toBeTruthy();
  });

  it('exporting: progress card with the kit bar value', () => {
    renderState('exporting');
    expect(screen.getByText('Exporting…')).toBeTruthy();
    expect(screen.getByTestId('export/bar').props.accessibilityValue.now).toBe(70);
  });

  it('export-error: failure copy + retry', () => {
    renderState('export-error');
    expect(screen.getByText('Export failed')).toBeTruthy();
    expect(
      screen.getByText('Something went wrong creating the file. Check available storage and try again.'),
    ).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('done: success copy + share/save actions', () => {
    renderState('done');
    expect(screen.getByText('Exported 320 cards')).toBeTruthy();
    expect(screen.getByText('Your file is ready to share or save.')).toBeTruthy();
    expect(screen.getByText('Share file')).toBeTruthy();
    expect(screen.getByText('Save to device')).toBeTruthy();
  });
});

describe('ExportScreen — interactions', () => {
  it('config controls fire their callbacks', () => {
    const onPickScope = jest.fn();
    const onPickFormat = jest.fn();
    const onPickSeparator = jest.fn();
    const onToggleSrs = jest.fn();
    const onExport = jest.fn();
    renderState('config', { onPickScope, onPickFormat, onPickSeparator, onToggleSrs, onExport });

    fireEvent.press(screen.getByText('Incl. sub-decks'));
    expect(onPickScope).toHaveBeenCalledWith('subtree');
    fireEvent.press(screen.getByTestId('export/format-xlsx'));
    expect(onPickFormat).toHaveBeenCalledWith(1);
    fireEvent.press(screen.getByTestId('export/sep-2'));
    expect(onPickSeparator).toHaveBeenCalledWith(2);
    fireEvent.press(screen.getByTestId('export/incl-srs-switch'));
    expect(onToggleSrs).toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('export/do-export'));
    expect(onExport).toHaveBeenCalled();
  });

  it('retry, share, save and back fire', () => {
    const onRetry = jest.fn();
    renderState('export-error', { onRetry });
    fireEvent.press(screen.getByTestId('export/retry'));
    expect(onRetry).toHaveBeenCalled();

    const onShare = jest.fn();
    const onSave = jest.fn();
    renderState('done', { onShare, onSave });
    fireEvent.press(screen.getByTestId('export/share'));
    expect(onShare).toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('export/save'));
    expect(onSave).toHaveBeenCalled();

    const onBack = jest.fn();
    renderState('config', { onBack });
    fireEvent.press(screen.getByTestId('export/back'));
    expect(onBack).toHaveBeenCalled();
  });
});
