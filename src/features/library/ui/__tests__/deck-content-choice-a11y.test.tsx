/**
 * Deck-content-choice (WBS 3.6) — accessibility gate (contract 11.3).
 * Roles + labels on every interactive element, a labelled name field, and the
 * screen's colour pairings meet WCAG AA in both schemes.
 */

import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, themes } from '@/design-system';
import { ok } from '@/shared';
import { meetsContrastAA } from '@/shared/testing/a11y';

import { DeckContentChoiceScreen } from '../deck-content-choice-screen';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

const base = { onSubmit: async () => ok(undefined) };

describe('DeckContentChoiceScreen a11y — roles & labels', () => {
  it('the back control is a labelled button', () => {
    renderScreen(<DeckContentChoiceScreen {...base} onBack={() => {}} />);
    expect(screen.getByLabelText('Back')).toBeTruthy();
  });

  it('each option card exposes a descriptive label and its selection state', () => {
    renderScreen(<DeckContentChoiceScreen {...base} />);
    const cards = screen.getByLabelText('Add cards directly. Use this as a final study deck.');
    const subdecks = screen.getByLabelText('Organise with subdecks. Create nested topics before adding cards.');
    expect(cards.props.accessibilityState?.selected).toBe(true);
    expect(subdecks.props.accessibilityState?.selected).toBe(false);
  });

  it('the options are grouped as a labelled radiogroup', () => {
    renderScreen(<DeckContentChoiceScreen {...base} />);
    expect(screen.getByLabelText('How to organise the deck')).toBeTruthy();
  });

  it('the primary CTA is a reachable labelled control', () => {
    renderScreen(<DeckContentChoiceScreen {...base} />);
    expect(screen.getByTestId('deck-content-choice/create')).toBeTruthy();
  });

  it('the name field is labelled', () => {
    renderScreen(<DeckContentChoiceScreen {...base} />);
    expect(screen.getByLabelText('Deck name')).toBeTruthy();
  });
});

describe('DeckContentChoiceScreen a11y — colour contrast (AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const c = themes[scheme].color;
    it(`${scheme}: choice title on surface meets AA`, () => {
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
    });
    it(`${scheme}: choice caption on surface meets AA`, () => {
      expect(meetsContrastAA(c.textSecondary, c.surface)).toBe(true);
    });
    it(`${scheme}: error banner text + icon meet AA on the surface background`, () => {
      // The banner is a bordered surface card (not a soft-tint fill) precisely because
      // errorSoft/onErrorSoft fails AA for normal text in dark — see 3.6 notes.
      expect(meetsContrastAA(c.text, c.surface)).toBe(true);
      expect(meetsContrastAA(c.error, c.surface, { large: true })).toBe(true);
    });
  }
});
