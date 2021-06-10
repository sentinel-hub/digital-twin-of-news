from datetime import datetime, timedelta
from pprint import pprint

import requests

from sentinelhub.time_utils import iso_to_datetime


class EventsService:
    def __init__(self, base_url, headers, dev_mode=False):
        self.base_url = base_url
        self.headers = headers
        self.session = requests.Session()
        self.session.headers.update(headers)
        self.dev_mode = dev_mode

    def get_existing_events_from_service(self, not_confirmed_age_limit=30):
        max_age = timedelta(days=not_confirmed_age_limit)
        current_time = datetime.utcnow()

        all_events = []
        count = 50
        params = {"confirmed": "all", "count": count, "offset": 0}

        while True:
            r = self.session.get(f"{self.base_url}/v1/events", params=params)
            r.raise_for_status()
            events = r.json()
            all_events.extend(events)
            if len(events) == count:
                params["offset"] += count
            else:
                break

        not_confirmed_events_to_be_confirmed_false = []
        not_confirmed_events_to_be_processed = []
        already_confirmed_events = []

        for event in all_events:
            event["already_saved"] = True

            if event["overrideConfirmed"] is None and event["confirmed"] is None:
                if current_time - iso_to_datetime(event["date"]) > max_age:
                    not_confirmed_events_to_be_confirmed_false.append(event)
                else:
                    not_confirmed_events_to_be_processed.append(event)
            else:
                already_confirmed_events.append(event)

        return (
            not_confirmed_events_to_be_processed,
            not_confirmed_events_to_be_confirmed_false,
            already_confirmed_events,
        )

    def set_events_confirmed_status(self, events, status):
        for event in events:
            res = self.session.patch(
                f'{self.base_url}/v1/events/{event["id"]}',
                data=json.dumps({"confirmed": status}),
            )

    def save_bad_event(self, event, event_type):
        payload = {
            "id": event["id"],
            "type": event_type.value,
            "date": event["date"],
            "locationName": event["locationName"],
            "title": event["title"],
            "description": event["description"],
            "lat": event["lat"],
            "lng": event["lng"],
            "articles": event["articles"],
        }
        if self.dev_mode:
            pprint(payload)
            return
        print(f"Saving new bad event {event['id']}")
        res = self.session.post(f"{self.base_url}/v1/events", json=payload)
        print(res.text)

    def save_good_event(self, event, event_type):
        payload = {
            "id": event["id"],
            "type": event_type.value,
            "date": event["date"],
            "locationName": event["locationName"],
            "title": event["title"],
            "description": event["description"],
            "lat": event["lat"],
            "lng": event["lng"],
            "zoom": event["zoom"],
            "articles": event["articles"],
            "visualizationDates": event["visualizationDates"],
            "confirmed": True,
        }
        if self.dev_mode:
            pprint(payload)
            return
        print(f"Saving new good event {event['id']}")
        res = self.session.post(f"{self.base_url}/v1/events", json=payload)
        print(res.text)

    def update_existing_event(
        self, eventId, lat=None, lng=None, zoom=None, confirmed=None, visualization_dates=None, articles=None
    ):
        payload = self.construct_payload(
            lat=lat, lng=lng, zoom=zoom, confirmed=confirmed, visualization_dates=visualization_dates, articles=articles
        )
        if self.dev_mode:
            pprint(payload)
            return
        print(f"Update existing event {eventId}")
        res = self.session.patch(f"{self.base_url}/v1/events/{eventId}", json=payload)
        print(res.text)

    def construct_payload(self, lat=None, lng=None, zoom=None, confirmed=None, visualization_dates=None, articles=None):
        payload = {}
        if lat is not None:
            payload["lat"] = lat
        if lng is not None:
            payload["lng"] = lng
        if zoom is not None:
            payload["zoom"] = zoom
        if visualization_dates is not None:
            payload["visualizationDates"] = visualization_dates
        if articles is not None:
            payload["articles"] = articles
        if confirmed in [None, True, False]:
            payload["confirmed"] = confirmed
        return payload
