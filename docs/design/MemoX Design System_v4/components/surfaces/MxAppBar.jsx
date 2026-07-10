import React from 'react';

/* MxAppBar — top app bar. Base class: appbar (modifier appbar-lg) */
export function MxAppBar({ title, eyebrow, large = false, leading, trailing, node, className = '' }) {
  if (large) {
    return (
      <header className={['appbar-lg', className].filter(Boolean).join(' ')} data-mx-node={node}>
        {(leading || trailing) ? (
          <div className="appbar-lg__row">
            {leading}
            <div style={{ flex: 1 }} />
            {trailing}
          </div>
        ) : null}
        {eyebrow ? <div className="appbar-lg__eyebrow">{eyebrow}</div> : null}
        <div className="appbar-lg__title">{title}</div>
      </header>
    );
  }
  return (
    <header className={['appbar', className].filter(Boolean).join(' ')} data-mx-node={node}>
      <div className="appbar__lead">{leading}</div>
      <div className="appbar__title">{title}</div>
      <div className="appbar__trail">{trailing}</div>
    </header>
  );
}
