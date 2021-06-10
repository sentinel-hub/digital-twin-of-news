from utils import get_env_var, get_events_ids

from events_service_utils import EventsService
from event_registry_utils import EventRegistry


EVENT_REGISTRY_API_KEY = get_env_var("EVENT_REGISTRY_API_KEY")
EVENTS_SERVICE_API_KEY = get_env_var("EVENTS_SERVICE_API_KEY")
EVENTS_SERVICE_URL = get_env_var("EVENTS_SERVICE_URL")
DEV_MODE = get_env_var("DEV_MODE")
DEV_MODE = DEV_MODE.lower() == "true"

EVENTS_SERVICE_HEADERS = {"x-api-key": EVENTS_SERVICE_API_KEY}

events_service = EventsService(EVENTS_SERVICE_URL, EVENTS_SERVICE_HEADERS, DEV_MODE)
event_registry = EventRegistry(EVENT_REGISTRY_API_KEY)


if __name__ == "__main__":
    (
        events_to_be_processed,
        events_to_be_confirmed_false,
        already_confirmed_events,
    ) = events_service.get_existing_events_from_service()
    all_events_ids = [
        *get_events_ids(events_to_be_processed),
        *get_events_ids(events_to_be_confirmed_false),
        *get_events_ids(already_confirmed_events),
    ]

    print(f"Found {len(all_events_ids)} events to update")

    for i, event_id in enumerate(all_events_ids):
        print(f"\n{i+1}/{len(all_events_ids)}")
        try:
            articles = event_registry.get_articles_for_event(event_id)
            print(f"Fetched articles for event {event_id}")
        except Exception as e:
            print("Something went wrong when fetching articles:", str(e))
        events_service.update_existing_event(event_id, articles=articles)
