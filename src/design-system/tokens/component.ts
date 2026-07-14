/**
 * Component dimension tokens (Layer 1) — fixed intrinsic sizes of individual
 * controls, verbatim from `tokens/component.css` (theme-independent, names
 * frozen: `--memox-comp-<component>-<prop>`). Every raw px that used to live
 * in components.css. Numbers are px.
 *
 * Source: docs/design/MemoX Design System_v4/tokens/component.css
 */

/** Fixed control geometry (`--memox-comp-*`), grouped per component. */
export const comp = {
  /** `--memox-comp-chip-height` */
  chipHeight: 34,

  /** switch (M3 spec 52×32; thumb grows 22→24 when on) */
  switchWidth: 52,
  switchHeight: 32,
  switchThumb: 22,
  switchThumbOn: 24,
  switchThumbInset: 4,
  switchThumbInsetOn: 2,
  switchThumbTravel: 20,

  /** badge */
  badgeHeight: 20,
  badgeMinWidth: 20,
  badgePadX: 6,
  badgeGap: 4,
  badgeDot: 10,

  /** avatar */
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,

  /** icon tile */
  iconTileMd: 48,
  iconTileLg: 60,

  /** icon button (small visual; hit area extends to 48 via hitSlop) */
  iconBtnSm: 36,

  /** search dock */
  searchDockHeight: 52,

  /** bottom-nav internals */
  navPillWidth: 56,
  navPillHeight: 30,
  navItemGap: 3,
  navSafePad: 4,

  /** segmented control (M3 segment visual) */
  segmentedSegHeight: 40,
} as const;

export type CompTokenName = keyof typeof comp;
