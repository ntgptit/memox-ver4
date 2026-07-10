import React from 'react';

/* MxChip — filter / choice chip. Base class: chip */
export function MxChip({ label, icon, selected = false, variant, node, onClick, children }) {
  const cls = ['chip'];
  if (selected) cls.push('chip--selected');
  if (variant) cls.push('chip--' + variant);
  return (
    <button type="button" className={cls.join(' ')} data-mx-node={node} onClick={onClick}>
      {icon ? <span className="material-symbols-rounded">{icon}</span> : null}
      {label || children}
    </button>
  );
}
