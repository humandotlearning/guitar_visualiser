// File: src/components/ui/switch.jsx
import React from 'react';

export const Switch = ({ id, checked, onCheckedChange }) => (
  <input type="checkbox" id={id} checked={checked} onChange={e => onCheckedChange(e.target.checked)} />
);