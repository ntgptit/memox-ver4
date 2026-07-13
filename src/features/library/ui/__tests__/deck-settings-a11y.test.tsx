/**
 * Deck-settings (WBS 4.5) — accessibility gate (contract 11.3). Roles + labels on the
 * app-bar actions, sheet menu items, move radios and confirm dialogs, plus AA contrast
 * (incl. the danger tone) in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { ok } from '@/shared';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { DeckSettingsScreen, type DeckSettingsScreenProps } from '../deck-settings-screen';
import { DECK_SETTINGS_FIXTURE } from '../deck-settings-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(over: Partial<DeckSettingsScreenProps> = {}): DeckSettingsScreenProps {
  return {
    deckTitle: DECK_SETTINGS_FIXTURE.deckTitle,
    languagePairs: DECK_SETTINGS_FIXTURE.languagePairs,
    currentPairId: DECK_SETTINGS_FIXTURE.currentPairId,
    onRename: async () => ok(undefined),
    onMove: async () => ok(undefined),
    onReset: async () => ok(undefined),
    onDelete: async () => ok(undefined),
    ...over,
  };
}

describe('DeckSettingsScreen a11y — roles & labels', () => {
  it('the app-bar exposes labelled back + actions buttons', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: null, onBack: () => {} })} />);
    expect(screen.getByLabelText('Back')).toBeTruthy();
    expect(screen.getByLabelText('Deck actions')).toBeTruthy();
  });

  it('each action-sheet item is a labelled button', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'actions' })} />);
    expect(screen.getByLabelText('Rename deck')).toBeTruthy();
    expect(screen.getByLabelText('Delete deck')).toBeTruthy();
  });

  it('the delete dialog announces a header + dismissible scrim', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'delete' })} />);
    expect(screen.getByRole('header', { name: 'Delete this deck?' })).toBeTruthy();
    expect(screen.getByLabelText('Dismiss')).toBeTruthy();
  });

  it('move rows are radios; the current pair announces disabled', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'move' })} />);
    expect(screen.getByTestId('deck-settings/move-lp-ja-en').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('deck-settings/move-lp-ko-en').props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe('DeckSettingsScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: menu label on the raised sheet meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surfaceRaised)).toBe(true);
    });
    it(`${scheme}: the danger delete label meets AA on the sheet`, () => {
      expect(meetsContrastAA(c.error, c.surfaceRaised)).toBe(true);
    });
    it(`${scheme}: dialog body text meets AA on the raised dialog`, () => {
      expect(meetsContrastAA(c.textSecondary, c.surfaceRaised)).toBe(true);
    });
  }
});
