import type { ReactNode } from 'react';

export interface DrawerItemProps {
  /** Leading icon (Material Symbols Rounded ligature name). */
  icon: string;
  /** Item label. */
  label: ReactNode;
  node?: string;
}

/** Drawer nav button: one row in the slide-out panel. */
export function DrawerItem(props: DrawerItemProps): JSX.Element;
