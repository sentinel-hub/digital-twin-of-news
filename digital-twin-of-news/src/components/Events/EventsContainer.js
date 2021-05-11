import React from 'react';
import { connect } from 'react-redux';

import EventListItem from './EventListItem';
import Loader from '../Loader/Loader';
import EventStatusFilters from './EventStatusFilters';

import './events.scss';

function EventsContainer(props) {
  const { showingGlobe, error, filteredEvents, apiKey } = props;

  if (error) {
    return (
      <div className={`events-container ${showingGlobe ? 'hidden' : ''}`}>
        <div className="events-error-text">{error}</div>
      </div>
    );
  }

  if (!filteredEvents) {
    return (
      <div className={`events-container ${showingGlobe ? 'hidden' : ''}`}>
        <Loader />
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className={`events-container ${showingGlobe ? 'hidden' : ''}`}>
        {apiKey && <EventStatusFilters />}
        <div className="events-error-text">No events found</div>
      </div>
    );
  }

  return (
    <div className={`events-container ${showingGlobe ? 'hidden' : ''}`}>
      {apiKey && <EventStatusFilters />}
      {filteredEvents.map((event) => {
        return <EventListItem key={event.id} {...event} showEventStatus={apiKey !== null} />;
      })}
    </div>
  );
}

const mapStoreToProps = (store) => ({
  error: store.events.eventsError,
  apiKey: store.auth.apiKey,
});

export default connect(mapStoreToProps, null)(EventsContainer);
