/**
 * Library app bar (shared by every state): menu + title + overflow.
 *
 * The kit renders this as a **static fixture** (hardcoded title + node ids) and
 * exposes **no props**. The Flutter `LibraryHeader` wires `onMenu` / `onOverflow`
 * — recorded as fixture-parameterized exceptions.
 */
export interface LibraryHeaderProps {}

export function LibraryHeader(): JSX.Element;
