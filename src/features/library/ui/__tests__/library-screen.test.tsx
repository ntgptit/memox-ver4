/**
 * Library screen (WBS 3.4) — state matrix + interaction tests. Renders each of the
 * 12 canonical states (contract §6) and drives search, filter, selection, and the
 * create sheet — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { LibraryScreen } from '../library-screen';
import { LIBRARY_FIXTURES, type LibraryFixtureKey } from '../library-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: LibraryFixtureKey, over: Partial<React.ComponentProps<typeof LibraryScreen>> = {}) {
  const f = LIBRARY_FIXTURES[key];
  return renderScreen(<LibraryScreen data={f.data} initialUi={f.ui} {...over} />);
}

describe('LibraryScreen — state matrix (contract §6)', () => {
  it('loaded: six decks with meta + FAB + controls row', () => {
    renderState('loaded');
    expect(screen.getByText('Korean TOPIK I')).toBeTruthy();
    expect(screen.getByText('Business Korean')).toBeTruthy();
    expect(screen.getByTestId('library/controls')).toBeTruthy();
    expect(screen.getByTestId('library/create')).toBeTruthy();
  });

  it('dense: 22 rows render, long titles clamp not crash', () => {
    renderState('dense');
    expect(screen.getAllByText('Advanced Idiomatic Expressions & Formal Register Workbook').length).toBe(2);
    expect(screen.getByTestId('library/deck-21')).toBeTruthy();
  });

  it('empty: build-your-library prompt with create + import CTAs', () => {
    renderState('empty');
    expect(screen.getByText('Build your learning library')).toBeTruthy();
    expect(screen.getByTestId('library/empty-create')).toBeTruthy();
    expect(screen.getByTestId('library/empty-import')).toBeTruthy();
  });

  it('loading: skeleton rows, no deck titles', () => {
    renderState('loading');
    expect(screen.queryByText('Korean TOPIK I')).toBeNull();
  });

  it('offline: banner + retry, decks still listed', () => {
    renderState('offline');
    expect(screen.getByTestId('library/offline-banner')).toBeTruthy();
    expect(screen.getByTestId('library/offline-retry')).toBeTruthy();
    expect(screen.getByText('Korean TOPIK I')).toBeTruthy();
  });

  it('create-sheet: Add card / Create deck / Import cards items', () => {
    renderState('create-sheet');
    expect(screen.getByTestId('library/create-card')).toBeTruthy();
    expect(screen.getByTestId('library/create-deck')).toBeTruthy();
    expect(screen.getByTestId('library/create-import')).toBeTruthy();
  });

  it('search-active: recents listed', () => {
    renderState('search-active');
    expect(screen.getByText('korean topik')).toBeTruthy();
    expect(screen.getByTestId('library/recent-2')).toBeTruthy();
  });

  it('search-results: deck + subdeck sections', () => {
    renderState('search-results');
    expect(screen.getByText('Decks')).toBeTruthy();
    expect(screen.getByText('Subdecks')).toBeTruthy();
    expect(screen.getByText('Korean TOPIK I')).toBeTruthy();
  });

  it('search-no-results: empty prompt with clear CTA', () => {
    renderState('search-no-results');
    expect(screen.getByText('No results for “business Korean”')).toBeTruthy();
    expect(screen.getByTestId('library/clear-search')).toBeTruthy();
  });

  it('filter-applied: summary row + only due decks', () => {
    renderState('filter-applied');
    expect(screen.getByText('2 decks match · Due only')).toBeTruthy();
    expect(screen.getByText('Korean TOPIK I')).toBeTruthy();
    expect(screen.getByText('Hanja Roots')).toBeTruthy();
    expect(screen.queryByText('Business Korean')).toBeNull();
  });

  it('filter-sheet: sort + filter options and Reset/Apply', () => {
    renderState('filter-sheet');
    expect(screen.getByTestId('library/fs-sort-recent')).toBeTruthy();
    expect(screen.getByTestId('library/fs-f-due')).toBeTruthy();
    expect(screen.getByTestId('library/fs-apply')).toBeTruthy();
  });

  it('selection: 3 selected announced in the bar', () => {
    renderState('selection');
    expect(screen.getByText('3 selected')).toBeTruthy();
    expect(screen.getByTestId('library/sel-all')).toBeTruthy();
  });

  it('dark: loaded renders under the dark scheme', () => {
    const f = LIBRARY_FIXTURES.loaded;
    renderScreen(<LibraryScreen data={f.data} initialUi={f.ui} />, 'dark');
    expect(screen.getByText('Korean TOPIK I')).toBeTruthy();
  });
});

describe('LibraryScreen — interactions', () => {
  it('tapping a deck opens it; the study bolt starts study', () => {
    const onOpenDeck = jest.fn();
    const onStudyDeck = jest.fn();
    renderState('loaded', { onOpenDeck, onStudyDeck });
    fireEvent.press(screen.getByTestId('library/deck-0'));
    expect(onOpenDeck).toHaveBeenCalledWith('d-topik');
    fireEvent.press(screen.getByTestId('library/study-1'));
    expect(onStudyDeck).toHaveBeenCalledWith('d-grammar');
  });

  it('FAB opens the create sheet; Create deck fires the intent', () => {
    const onCreateDeck = jest.fn();
    renderState('loaded', { onCreateDeck });
    fireEvent.press(screen.getByTestId('library/create'));
    fireEvent.press(screen.getByTestId('library/create-deck'));
    expect(onCreateDeck).toHaveBeenCalledTimes(1);
  });

  it('search: open → type → results → clear returns to browse', () => {
    renderState('loaded');
    fireEvent.press(screen.getByTestId('library/search-open'));
    fireEvent.changeText(screen.getByLabelText('Search decks and subdecks'), 'korean');
    expect(screen.getByText('Decks')).toBeTruthy();
    fireEvent.press(screen.getByTestId('library/search-clear'));
    expect(screen.getByTestId('library/controls')).toBeTruthy();
  });

  it('filter sheet applies the due-only filter and clears it', () => {
    renderState('loaded');
    fireEvent.press(screen.getByTestId('library/filters'));
    fireEvent.press(screen.getByTestId('library/fs-apply'));
    expect(screen.getByText('2 decks match · Due only')).toBeTruthy();
    fireEvent.press(screen.getByTestId('library/clear-filters'));
    expect(screen.queryByText('2 decks match · Due only')).toBeNull();
  });

  it('long-press enters selection; taps toggle; select-all selects everything', () => {
    renderState('loaded');
    fireEvent(screen.getByTestId('library/deck-0'), 'longPress');
    expect(screen.getByText('1 selected')).toBeTruthy();
    fireEvent.press(screen.getByTestId('library/deck-1'));
    expect(screen.getByText('2 selected')).toBeTruthy();
    fireEvent.press(screen.getByTestId('library/sel-all'));
    expect(screen.getByText('6 selected')).toBeTruthy();
  });

  it('offline retry fires onRetrySync', () => {
    const onRetrySync = jest.fn();
    renderState('offline', { onRetrySync });
    fireEvent.press(screen.getByTestId('library/offline-retry'));
    expect(onRetrySync).toHaveBeenCalledTimes(1);
  });
});
