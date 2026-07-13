/**
 * Languages screen (WBS 3.3) — state matrix + interaction/submit-lifecycle tests.
 *
 * Renders each canonical state (loading · error · empty · one · list · long-text ·
 * dark) and drives the add form (validation / failure / success) and the remove
 * confirmation (cancel / confirm / failure) — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';
import { err, ok, storageError, validationError } from '@/shared';

import { LanguagesScreen } from '../languages-screen';
import { LANGUAGES_FIXTURES } from '../fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

const noopAdd = async () => ok(undefined);
const noopRemove = async () => ok(undefined);

function props(overrides: Partial<React.ComponentProps<typeof LanguagesScreen>> = {}) {
  return { data: LANGUAGES_FIXTURES.list, onAdd: noopAdd, onRemove: noopRemove, ...overrides };
}

describe('LanguagesScreen — data states (contract §6)', () => {
  it('loading: shows a progress indicator', () => {
    renderScreen(<LanguagesScreen {...props({ data: LANGUAGES_FIXTURES.loading })} />);
    expect(screen.getByTestId('languages/loading')).toBeTruthy();
  });

  it('error: shows the message and a retry that fires onRetry', () => {
    const onRetry = jest.fn();
    renderScreen(<LanguagesScreen {...props({ data: LANGUAGES_FIXTURES.error, onRetry })} />);
    expect(screen.getByText("Couldn't load your language pairs.")).toBeTruthy();
    fireEvent.press(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('empty: shows the empty prompt and an add CTA', () => {
    renderScreen(<LanguagesScreen {...props({ data: LANGUAGES_FIXTURES.empty })} />);
    expect(screen.getByText('No language pairs yet')).toBeTruthy();
    expect(screen.getByTestId('languages/empty-add')).toBeTruthy();
  });

  it('one: renders a single pair', () => {
    renderScreen(<LanguagesScreen {...props({ data: LANGUAGES_FIXTURES.one })} />);
    expect(screen.getByText('Korean → English')).toBeTruthy();
    expect(screen.queryByText('Japanese → English')).toBeNull();
  });

  it('list: renders every pair with its deck-count subtitle', () => {
    renderScreen(<LanguagesScreen {...props({ data: LANGUAGES_FIXTURES.list })} />);
    expect(screen.getByText('Korean → English')).toBeTruthy();
    expect(screen.getByText('Japanese → English')).toBeTruthy();
    expect(screen.getByText('12 decks')).toBeTruthy();
    expect(screen.getByText('4 decks')).toBeTruthy();
  });

  it('long-text: singular/plural + long names both render', () => {
    renderScreen(<LanguagesScreen {...props({ data: LANGUAGES_FIXTURES.longText })} />);
    expect(screen.getByText('1 deck')).toBeTruthy();
    expect(screen.getByText('987 decks')).toBeTruthy();
    expect(screen.getByText('Standard Modern Cantonese → Brazilian Portuguese')).toBeTruthy();
  });

  it('dark: list renders under the dark scheme', () => {
    renderScreen(<LanguagesScreen {...props({ data: LANGUAGES_FIXTURES.list })} />, 'dark');
    expect(screen.getByText('Korean → English')).toBeTruthy();
  });
});

describe('LanguagesScreen — add form lifecycle', () => {
  it('opens the add sub-view from the list CTA', () => {
    renderScreen(<LanguagesScreen {...props()} />);
    fireEvent.press(screen.getByTestId('languages/add'));
    expect(screen.getByLabelText('Language to learn')).toBeTruthy();
    expect(screen.getByLabelText('Meaning language')).toBeTruthy();
  });

  it('success: submits the typed pair then returns to the list', async () => {
    const onAdd = jest.fn(async () => ok(undefined));
    renderScreen(<LanguagesScreen {...props({ data: LANGUAGES_FIXTURES.empty, onAdd })} />);
    fireEvent.press(screen.getByTestId('languages/empty-add'));
    fireEvent.changeText(screen.getByTestId('languages/learn-field'), 'Korean');
    fireEvent.changeText(screen.getByTestId('languages/native-field'), 'English');
    fireEvent.press(screen.getByTestId('languages/add-confirm'));
    expect(onAdd).toHaveBeenCalledWith({ learning: 'Korean', native: 'English' });
    await waitFor(() => expect(screen.getByText('No language pairs yet')).toBeTruthy());
  });

  it('validation: a field error is shown inline and stays on the form', async () => {
    const onAdd = async () => err(validationError([{ field: 'native', message: 'The two languages must be different.' }]));
    renderScreen(<LanguagesScreen {...props({ onAdd })} />);
    fireEvent.press(screen.getByTestId('languages/add'));
    fireEvent.changeText(screen.getByTestId('languages/learn-field'), 'Korean');
    fireEvent.changeText(screen.getByTestId('languages/native-field'), 'Korean');
    fireEvent.press(screen.getByTestId('languages/add-confirm'));
    await waitFor(() => expect(screen.getByText('The two languages must be different.')).toBeTruthy());
    expect(screen.getByLabelText('Meaning language')).toBeTruthy();
  });

  it('failure: a non-validation error surfaces as an alert banner', async () => {
    const onAdd = async () => err(storageError('Could not save your changes.'));
    renderScreen(<LanguagesScreen {...props({ onAdd })} />);
    fireEvent.press(screen.getByTestId('languages/add'));
    fireEvent.changeText(screen.getByTestId('languages/learn-field'), 'Korean');
    fireEvent.changeText(screen.getByTestId('languages/native-field'), 'English');
    fireEvent.press(screen.getByTestId('languages/add-confirm'));
    await waitFor(() => expect(screen.getByTestId('languages/add-error')).toBeTruthy());
  });
});

describe('LanguagesScreen — remove confirmation', () => {
  it('opens the confirm dialog from a row delete', () => {
    renderScreen(<LanguagesScreen {...props()} />);
    fireEvent.press(screen.getByTestId('languages/pair-lp-ko-en-del'));
    expect(screen.getByText('Remove language pair?')).toBeTruthy();
  });

  it('confirm: calls onRemove with the pair id and closes', async () => {
    const onRemove = jest.fn(async () => ok(undefined));
    renderScreen(<LanguagesScreen {...props({ onRemove })} />);
    fireEvent.press(screen.getByTestId('languages/pair-lp-ko-en-del'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('languages/remove-confirm'));
    });
    expect(onRemove).toHaveBeenCalledWith('lp-ko-en');
    await waitFor(() => expect(screen.queryByText('Remove language pair?')).toBeNull());
  });

  it('cancel: dismisses without removing', () => {
    const onRemove = jest.fn(async () => ok(undefined));
    renderScreen(<LanguagesScreen {...props({ onRemove })} />);
    fireEvent.press(screen.getByTestId('languages/pair-lp-ja-en-del'));
    fireEvent.press(screen.getByTestId('languages/remove-cancel'));
    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.queryByText('Remove language pair?')).toBeNull();
  });

  it('failure: a remove error stays open and shows the message', async () => {
    const onRemove = async () => err(storageError('Could not save your changes.'));
    renderScreen(<LanguagesScreen {...props({ onRemove })} />);
    fireEvent.press(screen.getByTestId('languages/pair-lp-ko-en-del'));
    fireEvent.press(screen.getByTestId('languages/remove-confirm'));
    await waitFor(() => expect(screen.getByTestId('languages/remove-error')).toBeTruthy());
    expect(screen.getByText('Remove language pair?')).toBeTruthy();
  });
});
