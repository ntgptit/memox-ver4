import React from 'react';

/* MxSearchDock — pill search field. Base class: search-dock */
export function MxSearchDock({ placeholder = 'Search', value, onChange, focused = false, flat = false, trailing, node }) {
  const cls = ['search-dock'];
  if (focused) cls.push('search-dock--focused');
  if (flat) cls.push('search-dock--flat');
  return (
    <div className={cls.join(' ')} data-mx-node={node}>
      <span className="material-symbols-rounded">search</span>
      <input className="search-dock__input" placeholder={placeholder} value={value} onChange={onChange} />
      {trailing}
    </div>
  );
}
