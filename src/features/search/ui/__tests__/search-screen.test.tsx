/**
 * Search screen (WBS 4.6) — state matrix + interactions. recent / loading / results /
 * filtered / no-results / dark, plus query typing, clear, filter chips, recent
 * use/remove/clear, and opening a hit.
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { SearchScreen, type SearchScreenProps } from '../search-screen';
import { SEARCH_FIXTURES } from '../search-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(fixtureKey: keyof typeof SEARCH_FIXTURES, over: Partial<SearchScreenProps> = {}): SearchScreenProps {
  return {
    ...SEARCH_FIXTURES[fixtureKey],
    onQueryChange: jest.fn(),
    onClear: jest.fn(),
    onFilterChange: jest.fn(),
    onUseRecent: jest.fn(),
    onRemoveRecent: jest.fn(),
    onClearRecent: jest.fn(),
    onOpenHit: jest.fn(),
    ...over,
  };
}

describe('SearchScreen — states', () => {
  it('empty-recent: shows recent history + clear all', () => {
    renderScreen(<SearchScreen {...props('empty-recent')} />);
    expect(screen.getByText('RECENT')).toBeTruthy();
    expect(screen.getByText('안녕하세요')).toBeTruthy();
    expect(screen.getByText('Clear all')).toBeTruthy();
  });

  it('results: shows hits with meaning, deck and status', () => {
    renderScreen(<SearchScreen {...props('results')} />);
    expect(screen.getByText('공부하다')).toBeTruthy();
    expect(screen.getByText('to study')).toBeTruthy();
    expect(screen.getByText('좋아하다')).toBeTruthy();
    expect(screen.getByTestId('search/filter-all')).toBeTruthy();
  });

  it('filtered: only cards matching the active filter show', () => {
    renderScreen(<SearchScreen {...props('filtered')} />);
    expect(screen.getByText('공부하다')).toBeTruthy(); // due
    expect(screen.queryByText('좋아하다')).toBeNull(); // mastered, filtered out
  });

  it('no-results: quotes the query', () => {
    renderScreen(<SearchScreen {...props('no-results')} />);
    expect(screen.getByText('No matches')).toBeTruthy();
    expect(screen.getByText(/xyz/)).toBeTruthy();
  });

  it('loading: exposes a progress indicator', () => {
    renderScreen(<SearchScreen {...props('loading')} />);
    expect(screen.getByTestId('search/loading')).toBeTruthy();
  });

  it('dark: results render under the dark scheme', () => {
    renderScreen(<SearchScreen {...props('results')} />, 'dark');
    expect(screen.getByText('공부하다')).toBeTruthy();
  });
});

describe('SearchScreen — interactions', () => {
  it('typing in the dock calls onQueryChange', () => {
    const onQueryChange = jest.fn();
    renderScreen(<SearchScreen {...props('empty-recent', { onQueryChange })} />);
    fireEvent.changeText(screen.getByLabelText('Search by word or meaning'), '공부');
    expect(onQueryChange).toHaveBeenCalledWith('공부');
  });

  it('clear button fires onClear (only when there is a query)', () => {
    const onClear = jest.fn();
    renderScreen(<SearchScreen {...props('results', { onClear })} />);
    fireEvent.press(screen.getByTestId('search/clear'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('a filter chip fires onFilterChange', () => {
    const onFilterChange = jest.fn();
    renderScreen(<SearchScreen {...props('results', { onFilterChange })} />);
    fireEvent.press(screen.getByTestId('search/filter-due'));
    expect(onFilterChange).toHaveBeenCalledWith('due');
  });

  it('recent row: use + remove fire with the query', () => {
    const onUseRecent = jest.fn();
    const onRemoveRecent = jest.fn();
    renderScreen(<SearchScreen {...props('empty-recent', { onUseRecent, onRemoveRecent })} />);
    fireEvent.press(screen.getByTestId('search/recent-0-use'));
    expect(onUseRecent).toHaveBeenCalledWith('안녕하세요');
    fireEvent.press(screen.getByTestId('search/recent-0-remove'));
    expect(onRemoveRecent).toHaveBeenCalledWith('안녕하세요');
  });

  it('clear all fires onClearRecent', () => {
    const onClearRecent = jest.fn();
    renderScreen(<SearchScreen {...props('empty-recent', { onClearRecent })} />);
    fireEvent.press(screen.getByText('Clear all'));
    expect(onClearRecent).toHaveBeenCalledTimes(1);
  });

  it('opening a result fires onOpenHit with the hit', () => {
    const onOpenHit = jest.fn();
    renderScreen(<SearchScreen {...props('results', { onOpenHit })} />);
    fireEvent.press(screen.getByTestId('search/result-c1'));
    expect(onOpenHit).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'c1' }));
  });
});
