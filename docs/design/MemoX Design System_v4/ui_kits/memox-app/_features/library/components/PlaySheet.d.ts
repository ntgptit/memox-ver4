/**
 * Library per-deck study/play bottom sheet: Learn / Review / Browse / Game / Player.
 *
 * The kit renders this as a **static fixture** (hardcoded deck title + node ids)
 * and exposes **no props**. The Flutter `PlaySheet` parameterizes the deck `node`
 * and wires `onLearn` / `onReview` / `onBrowse` / `onGame` / `onPlayer` — recorded
 * as fixture-parameterized exceptions.
 */
export interface PlaySheetProps {}

export function PlaySheet(): JSX.Element;
