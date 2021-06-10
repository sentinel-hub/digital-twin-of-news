import React from 'react';
import './CheckboxInvisible.scss';
export default function CheckboxInvisible({ onChange, value, isChecked }) {
  return (
    <input
      onChange={(event) => onChange(event)}
      className="checkbox-invisible"
      type="checkbox"
      value={value}
      checked={isChecked}
    />
  );
}
