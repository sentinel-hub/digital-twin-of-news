import { useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import store, { eventsSlice } from '../../store';
import { convertEventsFormat, filterSupportedEventTypes } from '../../utils/events.utils';

function EventsProvider({ apiKey, selectedDate }) {
  useEffect(() => {
    async function getEvents() {
      store.dispatch(eventsSlice.actions.setEventsList(null));
      store.dispatch(eventsSlice.actions.setError(null));
      const config = {
        params: {
          confirmed: apiKey ? 'all' : 'true_overriden',
          count: 100000,
          date_from: selectedDate.clone().subtract(6, 'month').format('YYYY-MM-DD'),
          date_to: selectedDate.format('YYYY-MM-DD'),
        },
      };

      axios
        .get(`${process.env.REACT_APP_DTON_API_ROOT_URL}/v1/events`, config)
        .then((response) => {
          const events = filterSupportedEventTypes(response.data.map((event) => convertEventsFormat(event)));
          store.dispatch(eventsSlice.actions.setEventsList(events));
        })
        .catch((error) => {
          store.dispatch(eventsSlice.actions.setError('Could not get events'));
        });
    }
    getEvents();
  }, [apiKey, selectedDate]);

  return null;
}

const mapStoreToProps = (store) => ({
  apiKey: store.auth.apiKey,
  selectedDate: store.dates.selectedDate,
  events: store.events.eventsList,
});

export default connect(mapStoreToProps, null)(EventsProvider);
