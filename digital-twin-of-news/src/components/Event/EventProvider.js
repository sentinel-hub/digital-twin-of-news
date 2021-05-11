import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { convertEventsFormat } from '../../utils/events.utils';
import { getApiKeyFromLocalStorage } from '../../auth/auth.utils';

function EventProvider({ children }) {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getEvent(eventId) {
      const apiKey = getApiKeyFromLocalStorage();
      const config = {
        headers: {
          'x-api-key': apiKey,
        },
      };
      const event = await axios
        .get(`${process.env.REACT_APP_DTON_API_ROOT_URL}/v1/events/${eventId}`, config)
        .then((r) => convertEventsFormat(r.data))
        .catch((error) => {
          console.error(error);
          if (error.response && error.response.status === 404) {
            return;
          }
          setError(error);
        });
      setEvent(event);
    }

    if (eventId) {
      getEvent(eventId);
    }
  }, [eventId]);

  return children({ event, error });
}

export default EventProvider;
