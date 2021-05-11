import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { getAppropriateClassName } from '../../utils/events.utils';
import './EventListItem.scss';

class EventListItem extends Component {
  render() {
    const {
      id,
      type,
      title,
      date,
      locationName,
      exactLocationName,
      confirmed,
      overrideConfirmed,
      showEventStatus,
    } = this.props;
    const statusClass = showEventStatus ? getAppropriateClassName(confirmed, overrideConfirmed) : '';
    return (
      <Link className="event-list-item-link" to={`/${id}`}>
        <div className={`event-list-item ${statusClass}`}>
          <div className="event-list-item-header">
            <div className="event-mark-wrapper">
              <div
                className={`event-mark ${type} ${getAppropriateClassName(confirmed, overrideConfirmed)}`}
              ></div>
            </div>
            <div className="event-title">{title}</div>
            <div className="event-date">{date.clone().utc().format('YYYY-MM-DD')}</div>
          </div>
          <div className="event-list-item-content">
            {exactLocationName && <div className="event-exact-location-name">{exactLocationName}</div>}
            {locationName && <div className="event-location-name">{locationName}</div>}
          </div>
        </div>
      </Link>
    );
  }
}

export default EventListItem;
