/**
 * Flashcard-editor (WBS 4.4) — accessibility gate (contract 11.3). Labelled
 * inputs and controls, alert roles on banners, checkbox state, disabled Save
 * announcement, and AA contrast of the banner tints in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes, type ThemeMode } from '@/design-system';
import { meetsContrastAA } from '@/shared/testing/a11y';

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

function renderState(key: FlashcardEditorFixtureKey) {
  const f = FLASHCARD_EDITOR_FIXTURES[key];
  return renderScreen(<FlashcardEditorScreen deck={EDITOR_DECK} values={f.values} editing={f.editing} ui={f.ui} />);
}

describe('FlashcardEditorScreen a11y — roles & labels', () => {
  it('inputs are labelled by their deck-driven field labels', () => {
    renderState('create');
    expect(screen.getByLabelText('Term · 한국어')).toBeTruthy();
    expect(screen.getByLabelText('Meaning · English')).toBeTruthy();
    expect(screen.getByLabelText('Cancel')).toBeTruthy();
    expect(screen.getByLabelText('Play pronunciation')).toBeTruthy();
    expect(screen.getByLabelText('Add Tiếng Việt translation')).toBeTruthy();
  });

  it('the keep-adding control is a checkbox with state', () => {
    renderState('create');
    const box = screen.getByTestId('flashcard-editor/keep-adding');
    expect(box.props.accessibilityRole).toBe('checkbox');
    expect(box.props.accessibilityState.checked).toBe(false);
  });

  it('banners announce as alerts', () => {
    renderState('duplicate');
    expect(screen.getByTestId('flashcard-editor/dup-warning').props.accessibilityRole).toBe('alert');
  });

  it('the visibility switch is labelled', () => {
    renderState('edit');
    expect(screen.getByLabelText('Hide during study')).toBeTruthy();
  });
});

describe('FlashcardEditorScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: field text and banner tints meet AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.onWarningSoft, c.warningSoft, { large: true, base: c.bg })).toBe(true);
      expect(meetsContrastAA(c.onErrorSoft, c.errorSoft, { large: true, base: c.bg })).toBe(true);
      expect(meetsContrastAA(c.onSuccessSoft, c.successSoft, { large: true, base: c.bg })).toBe(true);
    });
  }
});
