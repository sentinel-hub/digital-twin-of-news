from datetime import datetime

from sentinelhub import SHConfig

from utils import get_env_var, get_events_ids
from constants import EventType
from queries import wildfires_query, volcanoes_query, floods_query, droughts_query
from concept_thresholds import volcano_thresholds, wildfire_thresholds, droughts_thresholds
from events_processing_utils import enrich_events_with_position_and_visualizations
from events_utils import filter_events_by_concept_thresholds, filter_events_by_type
from events_service_utils import EventsService
from event_registry_utils import EventRegistry


################# SETTINGS #################
NOT_CONFIRMED_EVENT_AGE_LIMIT = 3000  # Age limit (in days) of already processed events which are confirmed:null at which they should be set to confirmed:false
############################################

# ENV VARS
EVENT_REGISTRY_API_KEY = get_env_var("EVENT_REGISTRY_API_KEY")
EVENT_REGISTRY_WILDFIRES_TOPIC_URI = get_env_var("EVENT_REGISTRY_WILDFIRES_TOPIC_URI")
EVENTS_SERVICE_API_KEY = get_env_var("EVENTS_SERVICE_API_KEY")
EVENTS_SERVICE_URL = get_env_var("EVENTS_SERVICE_URL")
INSTANCE_ID_WILDFIRES = get_env_var("INSTANCE_ID_WILDFIRES")
INSTANCE_ID_FLOODS = get_env_var("INSTANCE_ID_FLOODS")
INSTANCE_ID_DROUGHTS = get_env_var("INSTANCE_ID_DROUGHTS")
CLIENT_ID = get_env_var("CLIENT_ID")
CLIENT_SECRET = get_env_var("CLIENT_SECRET")

MEDIA_INTELLIGENCE_DATE_START = get_env_var("MEDIA_INTELLIGENCE_DATE_START", default="2020-01-01")
MEDIA_INTELLIGENCE_DATE_END = get_env_var("MEDIA_INTELLIGENCE_DATE_END", default=datetime.now().strftime("%Y-%m-%d"))
EVENT_TYPE_TO_RUN = get_env_var("EVENT_TYPE_TO_RUN", default="")
RUN_ONLY_NEW_EVENTS = get_env_var("RUN_ONLY_NEW_EVENTS", default="false")
RUN_ONLY_NEW_EVENTS = RUN_ONLY_NEW_EVENTS.lower() == "true"
DEV_MODE = get_env_var("DEV_MODE")
DEV_MODE = DEV_MODE.lower() == "true"
USE_EVENT_REGISTRY_CACHE = get_env_var("USE_EVENT_REGISTRY_CACHE", default="false")
USE_EVENT_REGISTRY_CACHE = USE_EVENT_REGISTRY_CACHE.lower() == "true"

EVENTS_SERVICE_HEADERS = {"x-api-key": EVENTS_SERVICE_API_KEY}

events_service = EventsService(EVENTS_SERVICE_URL, EVENTS_SERVICE_HEADERS, DEV_MODE)
event_registry = EventRegistry(EVENT_REGISTRY_API_KEY, DEV_MODE or USE_EVENT_REGISTRY_CACHE)

config = SHConfig()
config.sh_client_id = CLIENT_ID
config.sh_client_secret = CLIENT_SECRET

if EVENT_TYPE_TO_RUN:
    events_types_to_run = [EventType.from_str(EVENT_TYPE_TO_RUN)]
else:
    events_types_to_run = [event_type for event_type in EventType]

print(MEDIA_INTELLIGENCE_DATE_START, MEDIA_INTELLIGENCE_DATE_END)


if __name__ == "__main__":
    (
        events_to_be_processed,
        events_to_be_confirmed_false,
        already_confirmed_events,
    ) = events_service.get_existing_events_from_service(not_confirmed_age_limit=NOT_CONFIRMED_EVENT_AGE_LIMIT)
    existing_event_ids = [
        *get_events_ids(events_to_be_processed),
        *get_events_ids(events_to_be_confirmed_false),
        *get_events_ids(already_confirmed_events),
    ]

    print(
        f"{len(events_to_be_confirmed_false)} too old non-confirmed events, {len(events_to_be_processed)} yet to be processed and {len(already_confirmed_events)} already confirmed events.\n\n"
    )

    events_service.set_events_confirmed_status(events_to_be_confirmed_false, False)

    for event_type in events_types_to_run:
        if event_type == EventType.WILDFIRE:
            config.instance_id = INSTANCE_ID_WILDFIRES
            events_media_intelligence = event_registry.get_events_from_media_intelligence(
                wildfires_query(MEDIA_INTELLIGENCE_DATE_START, MEDIA_INTELLIGENCE_DATE_END), include_event_concepts=True
            )
            print(f"Original n of events: {len(events_media_intelligence)}")
            events_media_intelligence = filter_events_by_concept_thresholds(
                events_media_intelligence, wildfire_thresholds
            )
            print(f"After filtering: {len(events_media_intelligence)}")
            events_monitoring = event_registry.get_events_from_monitoring(EVENT_REGISTRY_WILDFIRES_TOPIC_URI)
        elif event_type == EventType.VOLCANO:
            config.instance_id = INSTANCE_ID_WILDFIRES
            events_media_intelligence = event_registry.get_events_from_media_intelligence(
                volcanoes_query(MEDIA_INTELLIGENCE_DATE_START, MEDIA_INTELLIGENCE_DATE_END), include_event_concepts=True
            )
            print(f"Original n of events: {len(events_media_intelligence)}")
            events_media_intelligence = filter_events_by_concept_thresholds(
                events_media_intelligence, volcano_thresholds
            )
            print(f"After filtering: {len(events_media_intelligence)}")
            events_monitoring = []
        elif event_type == EventType.FLOOD:
            config.instance_id = INSTANCE_ID_FLOODS
            events_media_intelligence = event_registry.get_events_from_media_intelligence(
                floods_query(MEDIA_INTELLIGENCE_DATE_START, MEDIA_INTELLIGENCE_DATE_END)
            )
            events_monitoring = []
        elif event_type == EventType.DROUGHT:
            config.instance_id = INSTANCE_ID_DROUGHTS
            events_media_intelligence = event_registry.get_events_from_media_intelligence(
                droughts_query(MEDIA_INTELLIGENCE_DATE_START, MEDIA_INTELLIGENCE_DATE_END), include_event_concepts=True
            )
            print(f"Original n of events: {len(events_media_intelligence)}")
            events_media_intelligence = filter_events_by_concept_thresholds(
                events_media_intelligence, droughts_thresholds
            )
            print(f"After filtering: {len(events_media_intelligence)}")
            events_monitoring = []
        else:
            continue

        events_monitoring = [event for event in events_monitoring if event["id"] not in existing_event_ids]
        existing_event_ids.extend([*get_events_ids(events_monitoring)])

        events_media_intelligence = [
            event for event in events_media_intelligence if event["id"] not in existing_event_ids
        ]
        existing_events_of_type = filter_events_by_type(events_to_be_processed, event_type)

        if RUN_ONLY_NEW_EVENTS:
            all_events = [*events_monitoring, *events_media_intelligence]
        else:
            all_events = [*existing_events_of_type, *events_monitoring, *events_media_intelligence]

        all_events = event_registry.enrich_events_with_articles(all_events)

        print(
            f"Type: {event_type.value}. {len(events_media_intelligence)} events from media intelligence and {len(events_monitoring)} events from media monitoring. {len(existing_events_of_type)} existing events of this type.\nTotal {len(all_events)} events to be processed."
        )

        enrich_events_with_position_and_visualizations(all_events, events_service, event_type, config)
