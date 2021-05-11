import React from 'react';
import ReactDOM from 'react-dom';

import Calendar from './Calendar';

import './CalendarHOC.scss';

// when clicking on the canvas, the click is somehow not registered
// so we should put calendar in a div that expands over the entire screen
// below the header and left of the event list, if screen is wide enough
function CalendarHOC(props) {
  const { calendarContainer } = props;
  return ReactDOM.createPortal(
    <div className="calendar-hoc">
      <Calendar {...props} />
    </div>,
    calendarContainer.current,
  );
}

export default CalendarHOC;
