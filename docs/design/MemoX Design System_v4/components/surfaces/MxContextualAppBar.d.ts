import type { ReactNode } from 'react';

export type MxAppBarVariant =
  | 'root-contextual'   // root destination with a context label that collapses to a title on scroll
  | 'root-standard'     // root destination with a fixed destination title
  | 'nested'            // detail screen: back + title + actions
  | 'search'            // search mode: back + search field + clear
  | 'selection'         // selection mode: close + "N selected" + selection actions
  | 'focused';          // study/onboarding/full-screen task: close + progress/context

export interface MxContextualAppBarProps {
  variant?: MxAppBarVariant;
  /** root-contextual only. `undefined` = collapse automatically on scroll; boolean pins the state. */
  collapsed?: boolean;
  /** root-contextual "at top" label (e.g. a date). Never shown at the same time as `title`. */
  context?: string;
  /** Destination / collapsed / nested title (single line, truncates). */
  title?: string;
  /** selection variant — number of selected items. */
  count?: number;
  /** search variant — { value, placeholder }. */
  search?: { value?: string; placeholder?: string };
  /** Leading slot override; auto-provided (back/close) for nested/search/selection/focused. */
  leading?: ReactNode;
  /** Right-side actions (icon buttons). MAX 2 directly visible; a 3rd+ goes to overflow. */
  actions?: ReactNode;
  /** Notification action with badge — { count } (numeric, 99+ cap) or { dot }. Omit when count is 0. */
  notification?: { count?: number; dot?: boolean };
  /** Avatar action (MxAvatar). Counts as one of the two allowed actions. Root variants only. */
  avatar?: ReactNode;
  node?: string;
  className?: string;
}

/**
 * Shared context-aware top app bar. Base class `cappbar`.
 *
 * Accessibility contract:
 * - Reading / focus order: leading nav → title/context → actions → notification → avatar.
 * - Title is not focusable (not interactive); it carries no role beyond text.
 * - Every icon-only action has an aria-label; the notification label announces unread count
 *   ("Notifications, 3 unread"); the selection count uses role="status".
 * - Foreground/divider/badge use theme tokens meeting >=4.5:1 for text; context label is
 *   text-secondary (not disabled).
 * - Reduced motion: the top→scrolled swap fades only (no translation); honours
 *   prefers-reduced-motion.
 */
export function MxContextualAppBar(props: MxContextualAppBarProps): JSX.Element;
