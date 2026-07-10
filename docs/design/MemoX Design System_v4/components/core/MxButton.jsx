import React from 'react';

/* MxButton — text button. Base class: btn (modifiers primary/secondary/outline/ghost) */
export function MxButton({ variant = 'primary', size, icon, trailingIcon, block = false, danger = false, disabled = false, node, className = '', children, onClick, type = 'button' }) {
  const cls = ['btn', variant];
  if (size) cls.push('btn--' + size);
  if (block) cls.push('btn--block');
  if (danger) cls.push('danger');
  if (className) cls.push(className);
  return (
    <button type={type} className={cls.join(' ')} data-mx-node={node} disabled={disabled} onClick={onClick}>
      {icon ? <span className="material-symbols-rounded">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
      {trailingIcon ? <span className="material-symbols-rounded">{trailingIcon}</span> : null}
    </button>
  );
}
