/**
 * Deck-detail app bar (shared by every state): back + title + play-audio + menu.
 *
 * The kit renders this as a **static fixture** (hardcoded title + node ids) and
 * exposes **no props**. The Flutter `DeckHeader` parameterizes `title` and wires
 * `onBack` / `onPlayAudio` (deck-level TTS) / `onMenu` — recorded as
 * fixture-parameterized exceptions.
 */
export interface DeckHeaderProps {}

export function DeckHeader(): JSX.Element;
