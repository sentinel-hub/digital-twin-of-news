import React from 'react';

import store, { eventsSlice } from '../../store';
function EventStatusFilters() {
  function onStatusFilterChange(filter) {
    store.dispatch(eventsSlice.actions.setStatusFilter(filter));
  }

  return (
    <div className="select-event-status">
      <div className="event-status-title">Filter by event status:</div>
      <button className="event-status-btn" onClick={() => onStatusFilterChange(null)}>
        All events
      </button>
      <button className="event-status-btn" onClick={() => onStatusFilterChange('override-confirmed-true')}>
        Manually accepted
      </button>
      <button
        className="event-status-btn probably-good"
        onClick={() => onStatusFilterChange('confirmed-true')}
      >
        Probably good, not manually confirmed
      </button>
      <button
        className="event-status-btn probably-bad"
        onClick={() => onStatusFilterChange('confirmed-false')}
      >
        Probably bad, not manually confirmed
      </button>
      <button
        className="event-status-btn not-confirmed"
        onClick={() => onStatusFilterChange('confirmed-null')}
      >
        Not decided, not manually confirmed
      </button>
      <button
        className="event-status-btn confirmed-bad"
        onClick={() => onStatusFilterChange('override-confirmed-false')}
      >
        Manually rejected
      </button>
    </div>
  );
}

export default EventStatusFilters;
