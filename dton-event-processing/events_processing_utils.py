from constants import EventType
from settings import (
    wildfires_settings_effis,
    sentinel_2_visualization_settings_wildfires,
    volcanoes_settings,
    sentinel_2_visualization_settings_volcanoes,
    floods_settings,
    visualization_settings_floods,
    droughts_settings,
    visualization_settings_droughts,
    air_pollution_settings,
    visualization_settings_air_pollution,
)
from wildfires_processing import process_wildfire_event_effis
from volcanoes_processing import process_volcano_event
from floods_processing import process_flood_event
from droughts_processing import process_drought_event
from air_pollution_processing import process_air_pollution_event


def update_event(event, lat, lng, zoom, visualization_dates):
    event["visualizationDates"] = visualization_dates
    event["lat"] = lat
    event["lng"] = lng
    event["zoom"] = zoom
    return event


def enrich_events_with_position_and_visualizations(events, service, event_type, config):
    if event_type == EventType.WILDFIRE:
        settings = wildfires_settings_effis
        visualization_settings = sentinel_2_visualization_settings_wildfires
        process_function = process_wildfire_event_effis
    elif event_type == EventType.VOLCANO:
        settings = volcanoes_settings
        visualization_settings = sentinel_2_visualization_settings_volcanoes
        process_function = process_volcano_event
    elif event_type == EventType.FLOOD:
        settings = floods_settings
        visualization_settings = visualization_settings_floods
        process_function = process_flood_event
    elif event_type == EventType.DROUGHT:
        settings = droughts_settings
        visualization_settings = visualization_settings_droughts
        process_function = process_drought_event
    elif event_type == EventType.AIR_POLLUTION:
        settings = air_pollution_settings
        visualization_settings = visualization_settings_air_pollution
        process_function = process_air_pollution_event

    for event in events:
        try:
            print(f"\n\n{event['id']}: {event['title']}\n")
            lat, lng, zoom, exact_date, visualization_dates = process_function(
                event, settings, visualization_settings, config
            )
        except Exception as e:
            print(e)
            service.save_bad_event(event, event_type)
            continue

        if event.get("already_saved", False):
            service.update_existing_event(
                event["id"],
                lat=lat,
                lng=lng,
                zoom=zoom,
                visualization_dates=visualization_dates,
                confirmed=True,
            )
        else:
            updated_event = update_event(event, lat, lng, zoom, visualization_dates)
            service.save_good_event(updated_event, event_type)
