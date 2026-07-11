/**
 * Game-recall prompt card: the term with audio + edit controls.
 *
 * The kit renders this as a **static fixture** — it hardcodes a sample term (친구)
 * and literal `node` ids on its MxCard/MxIconButton so the static parity generator
 * captures real DOM (see the JSX comment). It therefore exposes **no props**. The
 * Flutter `TermCard` parameterizes the fixtured content: `term` (String) plus the
 * real `onAudio` / `onEdit` callbacks — recorded as `fixture-parameterized`
 * exceptions in props-parity.exceptions.json.
 */
export interface RecallTermCardProps {}

export function RecallTermCard(): JSX.Element;
