import type { ReactNode } from 'react';

export type MxContextualAppBarVariant =
  | 'root'        // tab destination: left title + actions/notification/avatar (elevate-on-scroll)
  | 'nested'      // detail screen: back + title + actions (elevate-on-scroll)
  | 'search'      // search mode: back + filled search field + clear (elevate-on-scroll)
  | 'selection'   // selection mode: close + "N selected" + selection actions
  | 'modal';      // full-screen form/task: close + centered title + primary action

export interface MxContextualAppBarProps {
  variant?: MxContextualAppBarVariant;
  /** root/nested/search only. `undefined` = elevate automatically on scroll; boolean pins the state. */
  collapsed?: boolean;
  /** Destination / nested title (single line, truncates). Centered in the `modal` variant. */
  title?: string;
  /** selection variant — number of selected items. */
  count?: number;
  /** search variant — { value, placeholder }. */
  search?: { value?: string; placeholder?: string };
  /** Leading slot override; auto-provided (back for nested/search, close for modal/selection). */
  leading?: ReactNode;
  /** Right-side actions (icon buttons). MAX 2 directly visible; a 3rd+ goes to overflow. */
  actions?: ReactNode;
  /** Notification action with badge — { count } (numeric, 99+ cap) or { dot }. Omit when count is 0. */
  notification?: { count?: number; dot?: boolean };
  /** Avatar action (MxAvatar). Counts as one of the two allowed actions. Root variant only. */
  avatar?: ReactNode;
  node?: string;
  className?: string;
}

/**
 * The one app bar — a minimal Material-3 top bar at a single 56px height. Base class `cappbar`.
 * Variants root/nested/search elevate on scroll (transparent at top → surface + hairline divider).
 *
 * Accessibility contract:
 * - Reading / focus order: leading nav → title → actions → notification → avatar.
 * - Title is not focusable (not interactive); it carries no role beyond text.
 * - Every icon-only action has an aria-label; the notification label announces unread count
 *   ("Notifications, 3 unread"); the selection count uses role="status".
 * - Foreground/divider/badge use theme tokens meeting >=4.5:1 for text.
 * - Reduced motion: the top→scrolled swap fades only (no translation); honours
 *   prefers-reduced-motion.
 */
export function MxContextualAppBar(props: MxContextualAppBarProps): JSX.Element;
