/**
 * Deck-content-choice screen (WBS 3.6) — state matrix + choose lifecycle.
 * Default / named / long-text / dark, plus the submit lifecycle: choosing a
 * direction persists (name + organisation), validation (blank name) shows inline,
 * failure surfaces a banner, and Import is a tertiary action.
 */

import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';
import { err, ok, storageError, validationError } from '@/shared';

import { DeckContentChoiceScreen } from '../deck-content-choice-screen';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

const base = { onChoose: async () => ok(undefined) };

describe('DeckContentChoiceScreen — states', () => {
  it('default: heading + both choices + import, empty name', () => {
    renderScreen(<DeckContentChoiceScreen {...base} />);
    expect(screen.getByText('How do you want to organise it?')).toBeTruthy();
    expect(screen.getByTestId('deck-content-choice/subdecks')).toBeTruthy();
    expect(screen.getByTestId('deck-content-choice/cards')).toBeTruthy();
    expect(screen.getByText('Import from a file')).toBeTruthy();
    expect(screen.getByTestId('deck-content-choice/name').props.value).toBe('');
  });

  it('named: seeds the field from deckName', () => {
    renderScreen(<DeckContentChoiceScreen {...base} deckName="TOPIK I Grammar" />);
    expect(screen.getByTestId('deck-content-choice/name').props.value).toBe('TOPIK I Grammar');
  });

  it('long-text: a long name still renders both choices', () => {
    renderScreen(<DeckContentChoiceScreen {...base} deckName={'A'.repeat(60)} />);
    expect(screen.getByText('Organise with subdecks')).toBeTruthy();
    expect(screen.getByText('Add cards directly')).toBeTruthy();
  });

  it('dark: renders under the dark scheme', () => {
    renderScreen(<DeckContentChoiceScreen {...base} />, 'dark');
    expect(screen.getByText('How do you want to organise it?')).toBeTruthy();
  });
});

describe('DeckContentChoiceScreen — choose lifecycle', () => {
  it('persists the chosen organisation with the typed name', () => {
    const onChoose = jest.fn(async () => ok(undefined));
    renderScreen(<DeckContentChoiceScreen onChoose={onChoose} deckName="Grammar" />);
    fireEvent.press(screen.getByTestId('deck-content-choice/subdecks'));
    expect(onChoose).toHaveBeenCalledWith({ title: 'Grammar', organisation: 'subdecks' });
  });

  it('cards choice sends the cards organisation', () => {
    const onChoose = jest.fn(async () => ok(undefined));
    renderScreen(<DeckContentChoiceScreen onChoose={onChoose} deckName="Grammar" />);
    fireEvent.press(screen.getByTestId('deck-content-choice/cards'));
    expect(onChoose).toHaveBeenCalledWith({ title: 'Grammar', organisation: 'cards' });
  });

  it('validation: a blank name shows an inline field error', async () => {
    const onChoose = async () => err(validationError([{ field: 'title', message: 'Give the deck a name.' }]));
    renderScreen(<DeckContentChoiceScreen onChoose={onChoose} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-content-choice/subdecks'));
    });
    await waitFor(() => expect(screen.getByText('Give the deck a name.')).toBeTruthy());
  });

  it('failure: a non-validation error surfaces as a banner', async () => {
    const onChoose = async () => err(storageError('Could not save your changes.'));
    renderScreen(<DeckContentChoiceScreen onChoose={onChoose} deckName="Grammar" />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-content-choice/cards'));
    });
    await waitFor(() => expect(screen.getByTestId('deck-content-choice/error')).toBeTruthy());
  });

  it('import: fires onImport', () => {
    const onImport = jest.fn();
    renderScreen(<DeckContentChoiceScreen {...base} onImport={onImport} />);
    fireEvent.press(screen.getByTestId('deck-content-choice/import'));
    expect(onImport).toHaveBeenCalledTimes(1);
  });
});
