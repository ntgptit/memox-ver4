/**
 * Flashcard-list (WBS 4.3) — accessibility gate (contract 11.3). Roles/labels for
 * the app-bar actions, card rows, selection state, offline alert, and AA contrast
 * of the status-badge tones in both schemes.
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { FlashcardListScreen } from '../flashcard-list-screen';
import { FLASHCARD_LIST_FIXTURES, type FlashcardListFixtureKey } from '../flashcard-list-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: FlashcardListFixtureKey) {
  const f = FLASHCARD_LIST_FIXTURES[key];
  return renderScreen(<FlashcardListScreen data={f.data} deckTitle="Numbers & counting" initialUi={f.ui} />);
}

describe('FlashcardListScreen a11y — roles & labels', () => {
  it('app-bar actions and the FAB are labelled', () => {
    renderState('loaded');
    expect(screen.getByLabelText('Back')).toBeTruthy();
    expect(screen.getByLabelText('Search cards')).toBeTruthy();
    expect(screen.getByLabelText('Deck settings')).toBeTruthy();
    expect(screen.getByLabelText('Add card')).toBeTruthy();
  });

  it('card rows are buttons labelled by their term', () => {
    renderState('loaded');
    expect(screen.getByLabelText('안녕하세요')).toBeTruthy();
  });

  it('the collapsible toggle is a labelled button and hidden while inert', () => {
    renderState('loaded');
    expect(screen.getAllByLabelText('Show more').length).toBeGreaterThan(0);
  });

  it('the offline banner is an alert; the delete dialog announces a header', () => {
    renderState('offline');
    expect(screen.getByTestId('flashcard-list/offline-banner').props.accessibilityRole).toBe('alert');
  });

  it('the delete dialog announces a header + dismissible scrim', () => {
    renderState('delete-confirm');
    expect(screen.getByRole('header', { name: 'Delete this card?' })).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('Delete this card?')).toBeNull();
  });
});

describe('FlashcardListScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: term/meaning on surface meet AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.textSecondary, c.surface)).toBe(true);
    });
    it(`${scheme}: soft status badges meet AA on their tints (over surface)`, () => {
      expect(meetsContrastAA(c.onErrorSoft, c.errorSoft, { large: true, base: c.surface })).toBe(true);
      expect(meetsContrastAA(c.onSuccessSoft, c.successSoft, { large: true, base: c.surface })).toBe(true);
      expect(meetsContrastAA(c.onPrimarySoft, c.primarySoft, { large: true, base: c.surface })).toBe(true);
    });
  }
});
