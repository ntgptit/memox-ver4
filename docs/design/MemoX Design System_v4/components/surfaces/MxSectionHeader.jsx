import React from 'react';

/* MxSectionHeader — list/section label row. Base class: section-head */
export function MxSectionHeader({ title, caption, action, onAction, node }) {
  return (
    <div className="section-head" data-mx-node={node}>
      <div className="section-head__text">
        <div className="section-head__title">{title}</div>
        {caption ? <div className="section-head__caption">{caption}</div> : null}
      </div>
      {action ? <span className="section-head__action" onClick={onAction} role="button" tabIndex={0}>{action}</span> : null}
    </div>
  );
}
