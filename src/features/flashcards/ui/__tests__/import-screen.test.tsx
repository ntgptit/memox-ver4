/**
 * Import screen (WBS 9.1) — the 7-state matrix renders the kit copy verbatim and
 * every control fires its callback (source cards, paste box, separator chips,
 * continue, import, retry, back-to-deck).
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/design-system';

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

function renderState(key: ImportFixtureKey, props: Partial<React.ComponentProps<typeof ImportScreen>> = {}) {
  const f = IMPORT_FIXTURES[key];
  return renderScreen(<ImportScreen ui={f.ui} data={f.data} {...props} />);
}

describe('ImportScreen — state matrix', () => {
  it('source: the three sources and the paste box', () => {
    renderState('source');
    expect(screen.getByText('CHOOSE SOURCE')).toBeTruthy();
    expect(screen.getByText('CSV file')).toBeTruthy();
    expect(screen.getByText('Excel')).toBeTruthy();
    expect(screen.getByText('Paste text')).toBeTruthy();
    expect(screen.getByTestId('import/paste')).toBeTruthy();
  });

  it('mapping: separator chips, column mapping, table + Continue', () => {
    renderState('mapping');
    expect(screen.getByText('SEPARATOR')).toBeTruthy();
    expect(screen.getByText('Tab')).toBeTruthy();
    expect(screen.getByText('Column A → Term')).toBeTruthy();
    expect(screen.getByText('Column B → Meaning')).toBeTruthy();
    expect(screen.getByText('안녕하세요')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('preview: count label + import CTA, no callout', () => {
    renderState('preview');
    expect(screen.getByText('PREVIEW · 124 CARDS')).toBeTruthy();
    expect(screen.getByText('Import 124 cards')).toBeTruthy();
    expect(screen.queryByTestId('import/dup-warning')).toBeNull();
  });

  it('dup-warning: adds the callout above the preview', () => {
    renderState('dup-warning');
    expect(screen.getByText('8 cards already exist — import anyway?')).toBeTruthy();
    expect(screen.getByText('Import 124 cards')).toBeTruthy();
  });

  it('importing: progress card with the running count', () => {
    renderState('importing');
    expect(screen.getByText('Importing…')).toBeTruthy();
    expect(screen.getByText('77 / 124 cards · don’t close this screen')).toBeTruthy();
    expect(screen.getByTestId('import/importing-bar').props.accessibilityValue.now).toBe(62);
  });

  it('import-error: failure copy + retry', () => {
    renderState('import-error');
    expect(screen.getByText('Import failed')).toBeTruthy();
    expect(screen.getByText('Couldn’t read the file at row 78. Check the format and try again.')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('done: success copy names the deck', () => {
    renderState('done');
    expect(screen.getByText('Imported 124 cards')).toBeTruthy();
    expect(screen.getByText('The new cards were added to “TOPIK I — Vocabulary”.')).toBeTruthy();
    expect(screen.getByText('Back to deck')).toBeTruthy();
  });
});

describe('ImportScreen — interactions', () => {
  it('source: cards + paste box fire their callbacks', () => {
    const onPickSource = jest.fn();
    const onChangePasted = jest.fn();
    renderState('source', { onPickSource, onChangePasted });
    fireEvent.press(screen.getByTestId('import/source-0'));
    expect(onPickSource).toHaveBeenCalledWith(0);
    fireEvent.press(screen.getByTestId('import/source-2'));
    expect(onPickSource).toHaveBeenCalledWith(2);
    fireEvent.changeText(screen.getByTestId('import/paste'), 'a\tb');
    expect(onChangePasted).toHaveBeenCalledWith('a\tb');
  });

  it('mapping: chips, swap and Continue fire', () => {
    const onPickSeparator = jest.fn();
    const onSwapMapping = jest.fn();
    const onContinue = jest.fn();
    renderState('mapping', { onPickSeparator, onSwapMapping, onContinue });
    fireEvent.press(screen.getByTestId('import/sep-1'));
    expect(onPickSeparator).toHaveBeenCalledWith(1);
    fireEvent.press(screen.getByTestId('import/map-term-pick'));
    expect(onSwapMapping).toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('import/to-preview'));
    expect(onContinue).toHaveBeenCalled();
  });

  it('preview/import-error/done: import, retry and back-to-deck fire', () => {
    const onImport = jest.fn();
    renderState('dup-warning', { onImport });
    fireEvent.press(screen.getByTestId('import/do-import'));
    expect(onImport).toHaveBeenCalled();

    const onRetry = jest.fn();
    renderState('import-error', { onRetry });
    fireEvent.press(screen.getByTestId('import/retry'));
    expect(onRetry).toHaveBeenCalled();

    const onGoDeck = jest.fn();
    renderState('done', { onGoDeck });
    fireEvent.press(screen.getByTestId('import/go-deck'));
    expect(onGoDeck).toHaveBeenCalled();
  });

  it('the nested bar back button fires', () => {
    const onBack = jest.fn();
    renderState('source', { onBack });
    fireEvent.press(screen.getByTestId('import/back'));
    expect(onBack).toHaveBeenCalled();
  });
});
