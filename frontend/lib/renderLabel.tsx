import React from 'react';

export function renderLabel(label: string): React.ReactNode {
  if (!label) return null;
  const parts = label.split(/([\x60][^\x60]+[\x60])/g);
  if (parts.length === 1) return label;
  return React.createElement(
    React.Fragment,
    null,
    ...parts.map((part, i) => {
      if (part.startsWith('\x60') && part.endsWith('\x60')) {
        const code = part.slice(1, -1);
        return React.createElement('code', { key: i, className: 'inline-code' }, code);
      }
      return React.createElement(React.Fragment, { key: i }, part);
    })
  );
}
