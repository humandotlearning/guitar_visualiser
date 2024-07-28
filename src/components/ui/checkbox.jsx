import React from 'react';

export const Checkbox = ({ checked, onCheckedChange, id }) => (
  <input type="checkbox" checked={checked} onChange={e => onCheckedChange(e.target.checked)} id={id} />
);
