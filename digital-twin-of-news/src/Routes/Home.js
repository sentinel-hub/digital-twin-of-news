import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';

import Globe from '../components/Globe/Globe';
import EventsContainer from '../components/Events/EventsContainer';
import DocumentationMenu from '../components/DocumentationMenu/DocumentationMenu';

import './Home.scss';
import useWindowSize from '../utils/useWindowSize';
import { DOCUMENTATION } from '../const';

function Home(props) {
  const [showingGlobe, setShowingGlobe] = useState(true);
  const [showDocumentationMenu, setShowDocumentationMenu] = useState(false);
  const calendarHolder = useRef(null);
  const windowSize = useWindowSize();

  const { filteredEvents } = props;

  function toggleDocumentationMenu() {
    setShowDocumentationMenu((prev) => !prev);
  }

  return (
    <>
      <div className="calendar-holder" ref={calendarHolder} />
      <Globe
        onShowDocumentationMenuClick={toggleDocumentationMenu}
        windowSize={windowSize}
        filteredEvents={filteredEvents}
        showingGlobe={showingGlobe}
        setShowingGlobe={(value) => setShowingGlobe(value)}
        calendarHolder={calendarHolder}
      />
      <EventsContainer filteredEvents={filteredEvents} showingGlobe={showingGlobe} />
      {showDocumentationMenu && (
        <DocumentationMenu
          onCloseClick={toggleDocumentationMenu}
          items={DOCUMENTATION}
          onOutsideClick={toggleDocumentationMenu}
        />
      )}
    </>
  );
}

const mapStoreToProps = (store) => {
  const { eventsList } = store.events;
  const { type, status } = store.events.filters;
  const { apiKey } = store.auth;

  let filteredEvents = eventsList;

  if (eventsList && type !== 'all-types') {
    filteredEvents = filteredEvents.filter((event) => event.type === type);
  }

  if (apiKey && eventsList && status !== 'all-events') {
    filteredEvents = filteredEvents.filter((event) => filterByStatus(event, status));
  }

  return { filteredEvents };
};

function filterByStatus(event, statusFilter) {
  const { confirmed, overrideConfirmed } = event;
  switch (statusFilter) {
    case 'confirmed-true':
      return confirmed === true && overrideConfirmed === null;
    case 'confirmed-false':
      return (confirmed === false) & (overrideConfirmed === null);
    case 'confirmed-null':
      return (confirmed === null) & (overrideConfirmed === null);
    case 'override-confirmed-true':
      return overrideConfirmed === true;
    case 'override-confirmed-false':
      return overrideConfirmed === false;
    default:
      return true;
  }
}
export default connect(mapStoreToProps)(Home);
