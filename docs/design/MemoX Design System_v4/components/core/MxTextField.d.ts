/**
 * Bare inline text input — borderless and token-styled, for editable text inside a
 * feature surface (editor fields, game answers, paste boxes). The visible box, if
 * any, belongs to the surrounding container; this component is only the input.
 * @startingPoint section="Core" subtitle="Text field — bare inline input" viewport="320x120"
 */
export interface MxTextFieldProps {
  value?: string;
  placeholder?: string;
  /** Renders a multi-line textarea instead of a single-line input. */
  multiline?: boolean;
  /** Minimum visible rows when `multiline`. */
  rows?: number;
  /** Horizontal alignment of the text and placeholder. */
  align?: 'start' | 'center';
  autoFocus?: boolean;
  node?: string;
  className?: string;
  onChange?: (event: unknown) => void;
}

export function MxTextField(props: MxTextFieldProps): JSX.Element;
