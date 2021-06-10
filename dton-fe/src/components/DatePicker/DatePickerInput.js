import React, { useState, useEffect } from 'react';
import moment from 'moment';

function DatePickerInput(props) {
  const { onClick, dateFormat, selectedDay, setSelectedDay, onValueConfirmed, minDate, maxDate } = props;
  const [dateValue, setDateValue] = useState(selectedDay.utc().format(dateFormat));

  useEffect(() => {
    setDateValue(props.selectedDay.utc().format(props.dateFormat));
  }, [props.selectedDay, props.dateFormat]);

  function isValueValidDate(value) {
    const parsedDate = moment.utc(value, dateFormat, true);
    return parsedDate.isValid() && parsedDate >= minDate && maxDate >= parsedDate;
  }

  function handleChange(e) {
    setDateValue(e.target.value);
    if (isValueValidDate(e.target.value)) {
      setSelectedDay(moment.utc(e.target.value));
    }
  }

  function handleBlur() {
    if (!isValueValidDate(dateValue)) {
      setDateValue(selectedDay.utc().format(dateFormat));
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      if (isValueValidDate(e.target.value)) {
        onValueConfirmed();
      }
    }
  }

  return (
    <div className="date-picker-input-wrapper">
      <input
        className="date-picker-input"
        value={dateValue}
        onClick={onClick}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
}

export default DatePickerInput;
