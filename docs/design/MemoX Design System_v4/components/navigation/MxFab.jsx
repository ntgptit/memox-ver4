import React from 'react';

/* MxFab — floating action button. Base class: fab */
export function MxFab({ icon, label, variant, round = false, node, onClick }) {
  const cls = ['fab'];
  if (variant) cls.push('fab--' + variant);
  if (round || !label) cls.push('fab--round');
  return (
    <button type="button" className={cls.join(' ')} data-mx-node={node} onClick={onClick}>
      {icon ? <span className="material-symbols-rounded">{icon}</span> : null}
      {label ? <span>{label}</span> : null}
    </button>
  );
}
