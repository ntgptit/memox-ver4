/**
 * Flashcard-editor screen (WBS 4.4) — state matrix + interaction tests. Renders
 * each of the 9 canonical states (contract §6) and drives typing, the More
 * options disclosure, translation add/remove, duplicate actions and the submit
 * lifecycle — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { FlashcardEditorScreen } from '../flashcard-editor-screen';
import { EDITOR_DECK, FLASHCARD_EDITOR_FIXTURES, type FlashcardEditorFixtureKey } from '../flashcard-editor-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: FlashcardEditorFixtureKey, over: Partial<React.ComponentProps<typeof FlashcardEditorScreen>> = {}) {
  const f = FLASHCARD_EDITOR_FIXTURES[key];
  return renderScreen(
    <FlashcardEditorScreen deck={EDITOR_DECK} values={f.values} editing={f.editing} ui={f.ui} {...over} />,
  );
}

describe('FlashcardEditorScreen — state matrix (contract §6)', () => {
  it('create: blank form, deck-driven labels, Save disabled, autofocus term', () => {
    renderState('create');
    expect(screen.getByText('New card')).toBeTruthy();
    expect(screen.getByText('Beginner Grammar')).toBeTruthy();
    expect(screen.getByText('Term · 한국어')).toBeTruthy();
    expect(screen.getByText('Meaning · English')).toBeTruthy();
    expect(screen.getByTestId('flashcard-editor/save').props.accessibilityState.disabled).toBe(true);
  });

  it('edit: filled values, Edit title, More options pre-expanded, Save enabled', () => {
    renderState('edit');
    expect(screen.getByText('Edit card')).toBeTruthy();
    expect(screen.getByDisplayValue('안녕하세요')).toBeTruthy();
    expect(screen.getByDisplayValue('Hello (formal)')).toBeTruthy();
    expect(screen.getByText('#TOPIK_I')).toBeTruthy();
    expect(screen.getByDisplayValue('오늘 날씨가 좋네요.')).toBeTruthy(); // More options open
    expect(screen.getByTestId('flashcard-editor/save').props.accessibilityState.disabled).toBe(false);
  });

  it('validation: per-field errors + Save disabled', () => {
    renderState('validation');
    expect(screen.getByText('Enter a term.')).toBeTruthy();
    expect(screen.getByText('Enter a meaning.')).toBeTruthy();
    expect(screen.getByTestId('flashcard-editor/save').props.accessibilityState.disabled).toBe(true);
  });

  it('duplicate: warning banner naming the term with both actions', () => {
    renderState('duplicate');
    expect(screen.getByText(/already exists in this deck/)).toBeTruthy();
    expect(screen.getByTestId('flashcard-editor/dup-view')).toBeTruthy();
    expect(screen.getByTestId('flashcard-editor/dup-add')).toBeTruthy();
  });

  it('additional-translation: the alt-language field with a remove action', () => {
    renderState('additional-translation');
    expect(screen.getByText('Translation · Tiếng Việt')).toBeTruthy();
    expect(screen.getByDisplayValue('Xin chào')).toBeTruthy();
    expect(screen.getByTestId('flashcard-editor/translation-remove')).toBeTruthy();
  });

  it('audio-generating: the spinner replaces the play control', () => {
    renderState('audio-generating');
    expect(screen.getByLabelText('Generating pronunciation')).toBeTruthy();
    expect(screen.queryByTestId('flashcard-editor/audio-play')).toBeNull();
  });

  it('submitting: form frozen, Save shows Saving… and is disabled', () => {
    renderState('submitting');
    expect(screen.getByText('Saving…')).toBeTruthy();
    expect(screen.getByTestId('flashcard-editor/save').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('flashcard-editor/term-input').props.editable).toBe(false);
  });

  it('submit-error: recoverable banner with Try again; values kept', () => {
    renderState('submit-error');
    expect(screen.getByText(/Couldn’t save the card/)).toBeTruthy();
    expect(screen.getByTestId('flashcard-editor/save-retry')).toBeTruthy();
    expect(screen.getByDisplayValue('안녕하세요')).toBeTruthy();
  });

  it('submit-success: success banner, Save reads Done and stays disabled', () => {
    renderState('submit-success');
    expect(screen.getByText('Card saved.')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.getByTestId('flashcard-editor/save').props.accessibilityState.disabled).toBe(true);
  });

  it('dark: create renders under the dark scheme', () => {
    const f = FLASHCARD_EDITOR_FIXTURES.create;
    renderScreen(<FlashcardEditorScreen deck={EDITOR_DECK} values={f.values} ui={f.ui} />, 'dark');
    expect(screen.getByText('New card')).toBeTruthy();
  });
});

describe('FlashcardEditorScreen — interactions', () => {
  it('typing emits onChange patches', () => {
    const onChange = jest.fn();
    renderState('create', { onChange });
    fireEvent.changeText(screen.getByTestId('flashcard-editor/term-input'), '감사');
    expect(onChange).toHaveBeenCalledWith({ term: '감사' });
  });

  it('More options discloses the example pair + visibility switch', () => {
    renderState('create');
    expect(screen.queryByText('Hide during study')).toBeNull();
    fireEvent.press(screen.getByTestId('flashcard-editor/more-toggle'));
    expect(screen.getByText('Hide during study')).toBeTruthy();
    expect(screen.getByText('Example')).toBeTruthy();
  });

  it('add/remove translation intents fire', () => {
    const onAddTranslation = jest.fn();
    renderState('create', { onAddTranslation });
    fireEvent.press(screen.getByTestId('flashcard-editor/add-translation'));
    expect(onAddTranslation).toHaveBeenCalledTimes(1);

    const onRemoveTranslation = jest.fn();
    renderState('additional-translation', { onRemoveTranslation });
    fireEvent.press(screen.getByTestId('flashcard-editor/translation-remove'));
    expect(onRemoveTranslation).toHaveBeenCalledTimes(1);
  });

  it('duplicate actions + retry + save + cancel fire', () => {
    const onViewExisting = jest.fn();
    const onAddAnyway = jest.fn();
    renderState('duplicate', { onViewExisting, onAddAnyway });
    fireEvent.press(screen.getByTestId('flashcard-editor/dup-view'));
    fireEvent.press(screen.getByTestId('flashcard-editor/dup-add'));
    expect(onViewExisting).toHaveBeenCalledTimes(1);
    expect(onAddAnyway).toHaveBeenCalledTimes(1);

    const onRetrySave = jest.fn();
    renderState('submit-error', { onRetrySave });
    fireEvent.press(screen.getByTestId('flashcard-editor/save-retry'));
    expect(onRetrySave).toHaveBeenCalledTimes(1);

    const onSave = jest.fn();
    const onCancel = jest.fn();
    renderState('edit', { onSave, onCancel });
    fireEvent.press(screen.getByTestId('flashcard-editor/save'));
    fireEvent.press(screen.getByTestId('flashcard-editor/cancel'));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('audio play fires with the term present', () => {
    const onPlayAudio = jest.fn();
    renderState('edit', { onPlayAudio });
    fireEvent.press(screen.getByTestId('flashcard-editor/audio-play'));
    expect(onPlayAudio).toHaveBeenCalledTimes(1);
  });
});
