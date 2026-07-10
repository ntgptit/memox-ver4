/**
 * Game-mc prompt card: the prompt term with audio + edit controls.
 *
 * The kit renders this as a **static fixture** — it hardcodes a sample term (학교)
 * and literal `node` ids on its MxCard/MxIconButton so the static parity generator
 * captures real DOM (see the JSX comment). It therefore exposes **no props**. The
 * Flutter `PromptCard` parameterizes the fixtured content: `term` (String) plus the
 * real `onAudio` / `onEdit` callbacks — recorded as `fixture-parameterized`
 * exceptions.
 */
export interface McPromptCardProps {}

export function McPromptCard(): JSX.Element;
