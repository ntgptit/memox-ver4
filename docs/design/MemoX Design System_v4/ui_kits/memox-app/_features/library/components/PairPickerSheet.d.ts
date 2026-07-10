/**
 * Library language-pair bottom sheet.
 *
 * The kit renders this as a **static fixture** (hardcoded pair list + node ids)
 * and exposes **no props**. The Flutter `PairPickerSheet` parameterizes `pairs` /
 * `selectedId` and wires `onSelect` / `onAdd` — recorded as fixture-parameterized
 * exceptions.
 */
export interface PairPickerSheetProps {}

export function PairPickerSheet(): JSX.Element;
