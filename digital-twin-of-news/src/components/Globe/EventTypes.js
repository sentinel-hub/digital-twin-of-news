import React from 'react';
import { connect } from 'react-redux';

import EventType from './EventType';
import CheckboxInvisible from './CheckboxInvisible';

import store, { eventsSlice } from '../../store';
import { SUPPORTED_EVENT_TYPES, EVENT_TYPE_PROPERTIES } from '../../const';

import './EventTypes.scss';

function EventTypes({ type }) {
  function handleOnFilterChange(event) {
    const { value } = event.target;
    store.dispatch(eventsSlice.actions.setTypeFilters(value));
  }

  return (
    <div className="event-types">
      {SUPPORTED_EVENT_TYPES.map((eventType, i) => (
        <EventType
          key={i}
          isChecked={type === 'all-types' || type === eventType}
          onChange={handleOnFilterChange}
          name={EVENT_TYPE_PROPERTIES[eventType].name}
          value={eventType}
          dotColor={EVENT_TYPE_PROPERTIES[eventType].color}
        />
      ))}
      <div className="event-type-no-background">
        <label htmlFor="">All Events</label>
        <CheckboxInvisible
          isChecked={type === 'all-types'}
          onChange={handleOnFilterChange}
          value="all-types"
          name="all events"
        />
      </div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  type: store.events.filters.type,
});

export default connect(mapStoreToProps)(EventTypes);
