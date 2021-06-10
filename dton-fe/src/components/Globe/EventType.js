import React from 'react';
import CheckboxInvisible from './CheckboxInvisible';
export default function EventType({ name, value, dotColor, onChange, isChecked, className }) {
  return (
    <div
      value={value}
      className={`event-type ${!isChecked ? 'event-type-disabled' : ''} ${className ? className : null}`}
    >
      <span style={{ background: dotColor }} className="event-type-dot"></span>
      <div className="event-type-name">{name}</div>
      <CheckboxInvisible
        onChange={(event) => onChange(event)}
        className="event-type-checkbox"
        name={name}
        type="checkbox"
        value={value}
        checked={isChecked}
      />
    </div>
  );
}
