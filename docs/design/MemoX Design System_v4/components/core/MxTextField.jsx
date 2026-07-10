import React from 'react';

/* MxTextField — bare inline text input. Base class: field (modifiers center/multiline) */
export function MxTextField({ value, placeholder, multiline = false, rows = 3, align = 'start', autoFocus = false, node, className = '', onChange }) {
  const cls = ['field'];
  if (align === 'center') cls.push('field--center');
  if (multiline) cls.push('field--multiline');
  if (className) cls.push(className);
  const props = { className: cls.join(' '), placeholder, value, autoFocus, onChange, 'data-mx-node': node };
  return multiline
    ? <textarea {...props} rows={rows} />
    : <input {...props} type="text" />;
}
