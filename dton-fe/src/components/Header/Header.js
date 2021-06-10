import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import DatePicker from '../DatePicker/DatePicker';
import store, { datesSlice } from '../../store';
import { MIN_DATE } from '../../const';

import './header.scss';

function Header(props) {
  const { selectedDate, calendarHolder, showingGlobe, onInformationButtonClick } = props;

  function setSelectedDate(selectedDate) {
    store.dispatch(datesSlice.actions.setSelectedDate(selectedDate));
  }

  return (
    <div className="header">
      <div className="title">
        <span className="bold">Digital Twin </span> of the News
        <div>
          <i onClick={onInformationButtonClick} className="fas fa-info-circle info-icon"></i>
        </div>
      </div>
      <div className="navbar">
        <DatePicker
          id="event-datepicker"
          selectedDay={selectedDate}
          setSelectedDay={setSelectedDate}
          calendarContainer={calendarHolder}
          minDate={moment.utc(MIN_DATE)}
          maxDate={moment.utc()}
        />
        <div className="list-globe-switch" onClick={() => props.setShowingGlobe(!showingGlobe)}>
          {showingGlobe ? <i className="fas fa-list" /> : <i className="fas fa-globe-europe" />}
        </div>
      </div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  selectedDate: store.dates.selectedDate,
});

export default connect(mapStoreToProps, null)(Header);
