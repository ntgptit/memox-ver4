/**
 * SelectSheet — shared composite, ported from the kit's `_shared/SelectSheet.jsx`
 * (`window.SelectSheet`): a single-select option list inside a bottom Sheet
 * (title + rows, primary check on the active one). Thin wrapper over Sheet +
 * MenuItem; the caller wraps it in a Scrim when presented as an overlay.
 */

import { MenuItem } from './MenuItem';
import { Sheet } from './Sheet';

export interface SelectSheetOption {
  key: string;
  icon: string;
  label: string;
  selected?: boolean;
  onPress?: () => void;
  node?: string;
}

export interface SelectSheetProps {
  title: string;
  options: readonly SelectSheetOption[];
  node?: string;
}

export function SelectSheet({ title, options, node }: SelectSheetProps) {
  return (
    <Sheet title={title} node={node}>
      {options.map((o) => (
        <MenuItem key={o.key} icon={o.icon} label={o.label} selected={o.selected} onPress={o.onPress} node={o.node} />
      ))}
    </Sheet>
  );
}
