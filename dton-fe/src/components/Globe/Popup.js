import React from 'react';
import { Link } from 'react-router-dom';
import onClickOutside from 'react-onclickoutside';

import { getAppropriateClassName } from '../../utils/events.utils';

import './Popup.scss';

function Popup({ events, closePopup }) {
  function stopBubbling(evt) {
    evt.stopPropagation();
  }

  Popup.handleClickOutside = () => closePopup();

  return (
    <div className="popup-container" onClick={closePopup}>
      <div className="popup-list-wrapper">
        {events.length > 2 && (
          <div className="close-popup">
            <div className="cross" onClick={closePopup}>
              <div className="left">
                <div className="right"></div>
              </div>
            </div>
          </div>
        )}
        {events.map((event) => (
          <div key={event.id} className="popup" onClick={stopBubbling}>
            <div className="event-list-item">
              <div className="event-list-item-header">
                <div className="event-mark-wrapper">
                  <div
                    className={`event-mark ${event.type} ${getAppropriateClassName(
                      event.originalConfirmed,
                      event.overrideConfirmed,
                    )}`}
                  ></div>
                </div>
                <div className="event-title">{event.title}</div>
                <div className="event-date">{event.date.clone().utc().format('YYYY-MM-DD')}</div>
              </div>
              <div className="event-list-item-content">
                {event.exactLocationName && (
                  <div className="event-exact-location-name">{event.exactLocationName}</div>
                )}
                <div className="event-list-item-footer">
                  {event.locationName && <div className="event-location-name">{event.locationName}</div>}
                  <Link className="link" to={`/${event.id}`}>
                    <i className="fas fa-long-arrow-alt-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const clickOutsideConfig = {
  handleClickOutside: () => Popup.handleClickOutside,
};

export default onClickOutside(Popup, clickOutsideConfig);
