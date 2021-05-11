import moment from 'moment';

export async function getPrevNextDate(layer, bbox, direction, currentDate) {
  const minDate =
    layer.dataset && layer.dataset.minDate ? moment.utc(layer.dataset.minDate) : moment.utc('1970-01-01');
  const maxDate = layer.dataset && layer.dataset.maxDate ? moment.utc(layer.dataset.maxDate) : moment.utc();

  let newDate;
  const NO_DATES_FOUND = 'No dates found';

  if (direction === 'prev') {
    const start = minDate.utc().startOf('day');
    const startDates = [
      moment.utc(currentDate).subtract(3, 'months').startOf('day'),
      moment.utc(currentDate).subtract(1, 'year').startOf('day'),
      start,
    ].filter((date) => date.isSameOrAfter(start));
    const end = currentDate.clone().subtract(1, 'day').endOf('day');
    let dates = [];
    try {
      for (const startDate of startDates) {
        dates = await layer.findDatesUTC(bbox, startDate, end);
        if (dates.length > 0) {
          break;
        }
      }
    } catch (e) {
      console.error(e);
      throw NO_DATES_FOUND;
    }

    if (dates.length < 1) {
      throw NO_DATES_FOUND;
    }

    newDate = dates[0];
  }
  if (direction === 'next') {
    const start = currentDate.clone().utc().add(1, 'day').startOf('day');
    const end = maxDate.utc();
    const endDates = [
      moment.utc(currentDate).add(3, 'months').endOf('day'),
      moment.utc(currentDate).add(1, 'year').endOf('day'),
      end,
    ].filter((date) => date.isSameOrBefore(end));

    let dates = [];
    try {
      for (const endDate of endDates) {
        dates = await layer.findDatesUTC(bbox, start, endDate);
        if (dates.length > 0) {
          break;
        }
      }
    } catch (e) {
      console.error(e);
      throw NO_DATES_FOUND;
    }

    // if no future date is found throw no dates found
    if (dates.length < 1) {
      throw NO_DATES_FOUND;
    }

    newDate = dates[dates.length - 1];
  }

  return moment.utc(newDate);
}
