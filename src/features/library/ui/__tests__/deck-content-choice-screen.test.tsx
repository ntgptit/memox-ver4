/**
 * Deck-content-choice screen (WBS 3.6, form rework) — state matrix + submit lifecycle.
 * Default / named / long-text / dark, radio selection (cards preselected), and the
 * submit lifecycle: the single Create CTA persists (name + organisation), validation
 * (blank or duplicate name) shows inline, failure surfaces a banner and re-enables
 * the CTA, and Import is a tertiary action.
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

const base = { onSubmit: async () => ok(undefined) };

describe('DeckContentChoiceScreen — states', () => {
  it('default: name field, both options, Create CTA and import; cards preselected', () => {
    renderScreen(<DeckContentChoiceScreen {...base} />);
    expect(screen.getByTestId('deck-content-choice/name').props.value).toBe('');
    expect(screen.getByTestId('deck-content-choice/subdecks')).toBeTruthy();
    expect(screen.getByTestId('deck-content-choice/cards')).toBeTruthy();
    expect(screen.getByTestId('deck-content-choice/create')).toBeTruthy();
    expect(screen.getByText('Create deck')).toBeTruthy();
    expect(screen.getByText('Import from a file')).toBeTruthy();
    expect(screen.getByTestId('deck-content-choice/cards').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByTestId('deck-content-choice/subdecks').props.accessibilityState?.selected).toBe(false);
  });

  it('named: seeds the field from deckName', () => {
    renderScreen(<DeckContentChoiceScreen {...base} deckName="TOPIK I Grammar" />);
    expect(screen.getByTestId('deck-content-choice/name').props.value).toBe('TOPIK I Grammar');
  });

  it('save mode: the CTA reads Save for an existing deck', () => {
    renderScreen(<DeckContentChoiceScreen {...base} mode="save" deckName="Grammar" />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('long-text: a long name still renders both options', () => {
    renderScreen(<DeckContentChoiceScreen {...base} deckName={'A'.repeat(60)} />);
    expect(screen.getByText('Organise with subdecks')).toBeTruthy();
    expect(screen.getByText('Add cards directly')).toBeTruthy();
  });

  it('dark: renders under the dark scheme', () => {
    renderScreen(<DeckContentChoiceScreen {...base} />, 'dark');
    expect(screen.getByText('Create deck')).toBeTruthy();
  });
});

describe('DeckContentChoiceScreen — submit lifecycle', () => {
  it('Create persists the preselected cards organisation with the typed name', async () => {
    const onSubmit = jest.fn(async () => ok(undefined));
    renderScreen(<DeckContentChoiceScreen onSubmit={onSubmit} deckName="Grammar" />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-content-choice/create'));
    });
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Grammar', organisation: 'cards' });
  });

  it('selecting subdecks then Create sends the subdecks organisation', async () => {
    const onSubmit = jest.fn(async () => ok(undefined));
    renderScreen(<DeckContentChoiceScreen onSubmit={onSubmit} deckName="Grammar" />);
    fireEvent.press(screen.getByTestId('deck-content-choice/subdecks'));
    expect(screen.getByTestId('deck-content-choice/subdecks').props.accessibilityState?.selected).toBe(true);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-content-choice/create'));
    });
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Grammar', organisation: 'subdecks' });
  });

  it('selecting an option does NOT submit — only the CTA does', () => {
    const onSubmit = jest.fn(async () => ok(undefined));
    renderScreen(<DeckContentChoiceScreen onSubmit={onSubmit} deckName="Grammar" />);
    fireEvent.press(screen.getByTestId('deck-content-choice/subdecks'));
    fireEvent.press(screen.getByTestId('deck-content-choice/cards'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('validation: a blank/duplicate name shows an inline field error and re-enables the CTA', async () => {
    const onSubmit = async () => err(validationError([{ field: 'title', message: 'A deck with this name already exists.' }]));
    renderScreen(<DeckContentChoiceScreen onSubmit={onSubmit} deckName="Korean" />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-content-choice/create'));
    });
    await waitFor(() => expect(screen.getByText('A deck with this name already exists.')).toBeTruthy());
    expect(screen.getByText('Create deck')).toBeTruthy(); // not stuck on Creating…
  });

  it('failure: a non-validation error surfaces as a banner', async () => {
    const onSubmit = async () => err(storageError('Could not save your changes.'));
    renderScreen(<DeckContentChoiceScreen onSubmit={onSubmit} deckName="Grammar" />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-content-choice/create'));
    });
    await waitFor(() => expect(screen.getByTestId('deck-content-choice/error')).toBeTruthy());
  });

  it('submitting: the CTA disables and shows Creating… while the write is in flight', async () => {
    let resolve!: (r: ReturnType<typeof ok>) => void;
    const onSubmit = jest.fn(() => new Promise<ReturnType<typeof ok>>((r) => (resolve = r)));
    renderScreen(<DeckContentChoiceScreen onSubmit={onSubmit} deckName="Grammar" />);
    fireEvent.press(screen.getByTestId('deck-content-choice/create'));
    expect(screen.getByText('Creating…')).toBeTruthy();
    // A second press while in flight is a no-op.
    fireEvent.press(screen.getByTestId('deck-content-choice/create'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => resolve(ok(undefined)));
  });

  it('import: fires onImport', () => {
    const onImport = jest.fn();
    renderScreen(<DeckContentChoiceScreen {...base} onImport={onImport} />);
    fireEvent.press(screen.getByTestId('deck-content-choice/import'));
    expect(onImport).toHaveBeenCalledTimes(1);
  });
});
