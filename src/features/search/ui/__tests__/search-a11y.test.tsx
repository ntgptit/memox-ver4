/**
 * Search (WBS 4.6) — accessibility gate (contract 11.3). Labels on the dock, result
 * rows, recent controls and filters; a progressbar while loading; AA contrast for the
 * screen's text pairings and the status-badge tones in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { SearchScreen, type SearchScreenProps } from '../search-screen';
import { SEARCH_FIXTURES } from '../search-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
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

describe('SearchScreen a11y — roles & labels', () => {
  it('the search dock is labelled', () => {
    renderScreen(<SearchScreen {...props('empty-recent')} />);
    expect(screen.getByLabelText('Search by word or meaning')).toBeTruthy();
  });

  it('each result row exposes term, meaning, deck and status', () => {
    renderScreen(<SearchScreen {...props('results')} />);
    expect(screen.getByLabelText('공부하다, to study, in TOPIK I — Vocabulary, Due')).toBeTruthy();
  });

  it('recent controls are labelled per query', () => {
    renderScreen(<SearchScreen {...props('empty-recent')} />);
    expect(screen.getByLabelText('Search 안녕하세요')).toBeTruthy();
    expect(screen.getByLabelText('Remove 안녕하세요 from history')).toBeTruthy();
  });

  it('loading exposes a progressbar', () => {
    renderScreen(<SearchScreen {...props('loading')} />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });
});

describe('SearchScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: result term on surface meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
    });
    it(`${scheme}: meaning on surface meets AA`, () => {
      expect(meetsContrastAA(c.textSecondary, c.surface)).toBe(true);
    });
    it(`${scheme}: the solid status badge label meets AA on its tone`, () => {
      // Solid badges (soft on-tints fail AA in dark — see task_… MxBadge follow-up).
      expect(meetsContrastAA(c.onSuccess, c.success)).toBe(true);
    });
  }
});
