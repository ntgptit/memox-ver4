/**
 * DeckPlaySheet — shared composite, ported from the kit's `_shared/DeckPlaySheet.jsx`:
 * the "how do you want to study?" chooser opened from a deck/subdeck Study (bolt)
 * action on any deck surface. Branches three ways: the full Study session, the
 * à-la-carte Single mode picker, or hands-free Listen. The only entry into Mode
 * Picker and Player — shared so there is exactly one chooser contract.
 */

import { useTheme } from '../../theme';
import { Icon } from '../../icons';
import { Scrim } from './Scrim';
import { Sheet } from './Sheet';
import { MenuItem } from './MenuItem';

export interface DeckPlaySheetProps {
  /** Deck/subdeck title — the sheet is titled "Study {title}". */
  title: string;
  onSession?: () => void;
  onSingleMode?: () => void;
  onListen?: () => void;
  onDismiss?: () => void;
}

export function DeckPlaySheet({ title, onSession, onSingleMode, onListen, onDismiss }: DeckPlaySheetProps) {
  const t = useTheme();
  const chevron = <Icon name="chevron_right" size={t.iconSize.md} color={t.color.textTertiary} />;
  return (
    <Scrim align="end" node="deck-play/scrim" onDismiss={onDismiss}>
      <Sheet title={`Study ${title}`} node="deck-play/sheet">
        <MenuItem icon="bolt" tone={t.color.primary} label="Study session" onPress={onSession} node="deck-play/session" />
        <MenuItem icon="sports_esports" label="Single mode" trailing={chevron} onPress={onSingleMode} node="deck-play/single-mode" />
        <MenuItem icon="headphones" label="Listen" trailing={chevron} onPress={onListen} node="deck-play/listen" />
      </Sheet>
    </Scrim>
  );
}
