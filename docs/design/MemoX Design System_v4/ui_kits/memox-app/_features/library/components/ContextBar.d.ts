/**
 * Library context row: search + language-pair + sort.
 *
 * The kit renders this as a **static fixture** (hardcoded pair label + node ids)
 * and exposes **no props**. The Flutter `ContextBar` reads the pair from a
 * provider and wires `onSearch` / `onPair` / `onSort` — recorded as
 * fixture-parameterized exceptions.
 */
export interface ContextBarProps {}

export function ContextBar(): JSX.Element;
