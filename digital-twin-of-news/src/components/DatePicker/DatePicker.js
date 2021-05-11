import React, { Component } from 'react';
import moment from 'moment';

import DatePickerInput from './DatePickerInput';
import CalendarHOC from './CalendarHOC';
import { convertDateToUTC } from './Datepicker.utils';

import './DatePicker.scss';

const STANDARD_STRING_DATE_FORMAT = 'YYYY-MM-DD';

class DatePicker extends Component {
  state = {
    displayCalendar: false,
    availableDays: [],
  };

  openCalendar = () => {
    const { selectedDay } = this.props;
    this.setState({
      displayCalendar: true,
    });
    this.fetchAvailableDaysInMonth(selectedDay);
  };

  closeCalendar = () => {
    this.setState({
      displayCalendar: false,
    });
  };

  handleClickOutside = () => {
    this.closeCalendar();
  };

  handleDayClick = (day) => {
    this.props.setSelectedDay(moment.utc(day));
    this.closeCalendar();
  };

  handleMonthChange = (date) => {
    const { selectedDay, setSelectedDay } = this.props;
    const newSelectedDay = this.checkAndSetWithinAvailableRange(
      selectedDay.clone().month(date.getMonth()).year(date.getFullYear()),
    );
    setSelectedDay(newSelectedDay);
    this.fetchAvailableDaysInMonth(newSelectedDay);
  };

  onMonthOrYearDropdownChange = (month, year) => {
    const { selectedDay, setSelectedDay } = this.props;
    const newSelectedDay = this.checkAndSetWithinAvailableRange(selectedDay.clone().month(month).year(year));
    setSelectedDay(newSelectedDay);
    this.fetchAvailableDaysInMonth(newSelectedDay);
  };

  checkAndSetWithinAvailableRange = (newSelectedDay) => {
    const { minDate, maxDate } = this.props;
    if (newSelectedDay < minDate) {
      newSelectedDay = minDate.clone();
    }
    if (newSelectedDay > maxDate) {
      newSelectedDay = maxDate.clone();
    }
    return newSelectedDay;
  };

  fetchAvailableDaysInMonth = (date) => {
    if (!this.props.onQueryDatesForActiveMonth) return;
    this.props.onQueryDatesForActiveMonth(date).then((dateArray) => {
      dateArray = dateArray.map((d) => convertDateToUTC(d));
      this.setState({
        availableDays: dateArray,
      });
    });
  };

  render() {
    const {
      selectedDay,
      setSelectedDay,
      minDate,
      maxDate,
      calendarContainer,
      id,
      showNextPrevDateArrows,
      getAndSetNextPrevDate,
    } = this.props;
    const { displayCalendar, availableDays } = this.state;
    return (
      <div className={`date-picker ${displayCalendar ? id : ''} ${displayCalendar ? 'open' : ''}`}>
        <div className="duration-label">6 mths until</div>
        <DatePickerInput
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          dateFormat={STANDARD_STRING_DATE_FORMAT}
          onClick={this.openCalendar}
          onValueConfirmed={this.closeCalendar}
          showNextPrevDateArrows={showNextPrevDateArrows}
          getAndSetNextPrevDate={getAndSetNextPrevDate}
          minDate={minDate}
          maxDate={maxDate}
        />
        {displayCalendar && (
          <CalendarHOC
            selectedDay={selectedDay}
            minDate={minDate}
            maxDate={maxDate}
            locale={'en'}
            calendarContainer={calendarContainer}
            handleMonthChange={this.handleMonthChange}
            handleDayClick={this.handleDayClick}
            onMonthOrYearDropdownChange={this.onMonthOrYearDropdownChange}
            handleClickOutside={this.handleClickOutside}
            outsideClickIgnoreClass={id}
            highlightedDays={availableDays}
          />
        )}
      </div>
    );
  }
}

export default DatePicker;
