import type { ReactNode } from 'react';

export interface ActionCalloutProps {
  /** Soft-tint tone — picks the `*-soft` / `on-*-soft` token pair. `warning` is the base. @default 'warning' */
  tone?: 'primary' | 'warning' | 'success' | 'error';
  /** Leading status icon (Material Symbols Rounded ligature name). */
  icon: string;
  /** Inline message (supplied by the caller from ARB). */
  text: ReactNode;
  /** Optional trailing action, usually a small `MxButton`. */
  action?: ReactNode;
  node?: string;
}

/**
 * Soft-tinted inline banner (icon + message) with an optional trailing action.
 * Shared by the import dup-warning + mode-picker not-enough rows; the message is
 * always caller-supplied. Tinted via the `*-soft` token pair.
 */
export function ActionCallout(props: ActionCalloutProps): JSX.Element;
