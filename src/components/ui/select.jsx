import React from 'react';

export const Select = ({ children, value, onValueChange }) => (
  <select value={value} onChange={e => onValueChange(e.target.value)}>{children}</select>
);

export const SelectTrigger = ({ children }) => <div>{children}</div>;
export const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
export const SelectContent = ({ children }) => <div>{children}</div>;
export const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

