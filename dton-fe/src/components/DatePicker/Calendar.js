import React from 'react';
import onClickOutside from 'react-onclickoutside';
import DayPicker from 'react-day-picker';

import { getFirstDayOfWeek, getWeekDaysLong, getWeekDaysMin, getMonths } from './MomentLocaleUtils';
import { momentToDate } from './Datepicker.utils';
import Navbar from './Navbar';
import YearMonthForm from './YearMonthForm';

import 'react-day-picker/lib/style.css';
import './Calendar.scss';

function Calendar(props) {
  const {
    selectedDay,
    minDate,
    maxDate,
    locale,
    handleMonthChange,
    handleDayClick,
    onMonthOrYearDropdownChange,
    highlightedDays,
  } = props;

  const modifiers = {
    highlighted: highlightedDays,
  };

  return (
    <div className="calendar-wrapper">
      <DayPicker
        showOutsideDays
        selectedDays={momentToDate(selectedDay)}
        modifiers={modifiers}
        month={momentToDate(selectedDay)}
        onMonthChange={handleMonthChange}
        onDayClick={handleDayClick}
        disabledDays={[
          {
            after: momentToDate(maxDate),
            before: momentToDate(minDate),
          },
        ]}
        navbarElement={<Navbar minDate={minDate} maxDate={maxDate} selectedDate={selectedDay} />}
        captionElement={({ locale }) => (
          <YearMonthForm
            minFromDate={minDate}
            maxToDate={maxDate}
            onChange={onMonthOrYearDropdownChange}
            locale={locale}
            selectedDay={selectedDay}
          />
        )}
        locale={locale}
        weekdaysLong={getWeekDaysLong(locale)}
        weekdaysShort={getWeekDaysMin(locale)}
        months={getMonths(locale)}
        firstDayOfWeek={getFirstDayOfWeek(locale)}
      />
    </div>
  );
}

export default onClickOutside(Calendar);
