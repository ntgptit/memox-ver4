/**
 * Deck-settings screen (WBS 4.5) — overlay state matrix + lifecycle interactions.
 * action-sheet / rename / move / reset-confirm / delete-confirm, plus: opening each
 * overlay, rename save + validation, move (current disabled), and the danger confirms.
 */

import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';
import { err, ok, storageError, validationError } from '@/shared';

import { DeckSettingsScreen, type DeckSettingsScreenProps } from '../deck-settings-screen';
import { DECK_SETTINGS_FIXTURE } from '../deck-settings-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
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

describe('DeckSettingsScreen — overlay states', () => {
  it('action-sheet: lists the lifecycle actions', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'actions' })} />);
    expect(screen.getByTestId('deck-settings/action-rename')).toBeTruthy();
    expect(screen.getByTestId('deck-settings/action-move')).toBeTruthy();
    expect(screen.getByTestId('deck-settings/action-reset')).toBeTruthy();
    expect(screen.getByTestId('deck-settings/action-delete')).toBeTruthy();
  });

  it('rename: seeds the field with the deck name', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'rename' })} />);
    expect(screen.getByTestId('deck-settings/rename-input').props.value).toBe('Korean TOPIK I');
  });

  it('move: lists pairs and marks the current one', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'move' })} />);
    expect(screen.getByTestId('deck-settings/move-lp-ja-en')).toBeTruthy();
    expect(screen.getByTestId('deck-settings/move-lp-ko-en').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('reset-confirm: shows the danger reset dialog', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'reset' })} />);
    expect(screen.getByText('Reset progress?')).toBeTruthy();
    expect(screen.getByTestId('deck-settings/reset-dialog-ok')).toBeTruthy();
  });

  it('delete-confirm: shows the danger delete dialog', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'delete' })} />);
    expect(screen.getByText('Delete this deck?')).toBeTruthy();
  });

  it('dark: the action sheet renders under the dark scheme', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'actions' })} />, 'dark');
    expect(screen.getByText('Deck actions')).toBeTruthy();
  });
});

describe('DeckSettingsScreen — interactions', () => {
  it('action → rename opens the rename dialog', () => {
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'actions' })} />);
    fireEvent.press(screen.getByTestId('deck-settings/action-rename'));
    expect(screen.getByTestId('deck-settings/rename-input')).toBeTruthy();
  });

  it('rename: saving the new name calls onRename then closes', async () => {
    const onRename = jest.fn(async () => ok(undefined));
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'rename', onRename })} />);
    fireEvent.changeText(screen.getByTestId('deck-settings/rename-input'), 'New name');
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-settings/rename-ok'));
    });
    expect(onRename).toHaveBeenCalledWith('New name');
    await waitFor(() => expect(screen.queryByText('Rename deck')).toBeNull());
  });

  it('rename: a validation error stays open with an inline message', async () => {
    const onRename = async () => err(validationError([{ field: 'title', message: 'Give the deck a name.' }]));
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'rename', onRename })} />);
    fireEvent.changeText(screen.getByTestId('deck-settings/rename-input'), '');
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-settings/rename-ok'));
    });
    await waitFor(() => expect(screen.getByText('Give the deck a name.')).toBeTruthy());
  });

  it('move: pick a destination then apply (kit: select + Move button); current is inert', async () => {
    const onMove = jest.fn(async () => ok(undefined));
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'move', onMove })} />);
    fireEvent.press(screen.getByTestId('deck-settings/move-lp-ko-en')); // current → ignored
    fireEvent.press(screen.getByTestId('deck-settings/move-apply')); // nothing selected yet
    expect(onMove).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('deck-settings/move-lp-ja-en'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-settings/move-apply'));
    });
    expect(onMove).toHaveBeenCalledWith('lp-ja-en');
  });

  it('reset: confirming calls onReset', async () => {
    const onReset = jest.fn(async () => ok(undefined));
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'reset', onReset })} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-settings/reset-dialog-ok'));
    });
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('delete: confirming calls onDelete then onDone', async () => {
    const onDelete = jest.fn(async () => ok(undefined));
    const onDone = jest.fn();
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'delete', onDelete, onDone })} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-settings/delete-dialog-ok'));
    });
    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });

  it('delete: a failure keeps the dialog open with an error', async () => {
    const onDelete = async () => err(storageError('Could not delete.'));
    renderScreen(<DeckSettingsScreen {...props({ initialOverlay: 'delete', onDelete })} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('deck-settings/delete-dialog-ok'));
    });
    await waitFor(() => expect(screen.getByTestId('deck-settings/delete-dialog-error')).toBeTruthy());
    expect(screen.getByText('Delete this deck?')).toBeTruthy();
  });
});
