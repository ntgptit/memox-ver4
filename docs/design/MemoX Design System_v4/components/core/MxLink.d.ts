import type { ReactNode } from 'react';

export interface MxLinkProps {
  children?: ReactNode;
  /** Leading icon (Material Symbols name). */
  icon?: string;
  /** Trailing icon; defaults to `chevron_right`. Pass `null`/'' to omit. */
  trailingIcon?: string | null;
  /** Render an <a> with this href instead of a <button>. */
  href?: string;
  /** `sm` for a smaller (label-size) link. */
  size?: 'sm';
  node?: string;
  onClick?: () => void;
  className?: string;
}

/** Text / navigation link button (accent colour, no button chrome). Base class `link`. */
export function MxLink(props: MxLinkProps): JSX.Element;
