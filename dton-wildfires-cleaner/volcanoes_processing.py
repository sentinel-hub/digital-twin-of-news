from datetime import timedelta

from sentinelhub.time_utils import iso_to_datetime
from sentinelhub import DataCollection, BBox, CRS

from events_utils import get_locations_from_concepts
from processing.date_utils import get_exact_date, start_of_day, end_of_day, get_visualization_dates
from processing.bbox_utils import create_bbox
from wildfires_processing import process_wildfire_event, construct_visualization_dates_wildfires


def process_volcano_event(event, settings, visualization_settings, config):
    timerange_before = settings["timerange_before"]
    bbox_dimension = settings["bbox_dimension_for_exact_location"]
    data_collection = settings["data_collection"]
    evalscript = settings["evalscript"]
    layer_fis = settings["layer_fis"]
    resolution = settings["resolution"]
    default_zoom = settings["default_zoom"]

    TIMERANGE_BEFORE = visualization_settings["TIMERANGE_BEFORE"]
    TIMERANGE_AFTER = visualization_settings["TIMERANGE_AFTER"]
    MAX_CLOUD_COVERAGE_SEARCH = visualization_settings["MAX_CLOUD_COVERAGE_SEARCH"]
    MAX_CLOUD_COVERAGE_VISUALIZATION = visualization_settings["MAX_CLOUD_COVERAGE_VISUALIZATION"]
    MIN_COVERAGE = visualization_settings["MIN_COVERAGE"]
    cloud_coverage_evalscript = visualization_settings["cloud_coverage_evalscript"]
    visualization_dates_fis_layer = visualization_settings["visualization_dates_layer"]
    cloud_coverage_fis_resolution = visualization_settings["cloud_coverage_fis_resolution"]

    locations = get_locations_from_concepts(event["concepts"], stop_at_type="mountain")
    mountains = list(filter(lambda l: l["type"] == "mountain", locations))

    date = event["date"]
    to_time = end_of_day(iso_to_datetime(date))
    from_time = iso_to_datetime(date)
    from_time = from_time - timedelta(days=timerange_before)

    if len(mountains) == 0:
        print("Couldn't get exact coordinates of the volcano. Using the provided coordinates and wildfire process.")
        lat, lng, _, exact_date, visualization_dates = process_wildfire_event(
            event, settings, visualization_settings, config
        )
        return lat, lng, default_zoom, exact_date, visualization_dates

    lat = mountains[0]["lat"]
    lng = mountains[0]["lng"]

    bbox = create_bbox(lat, lng, bbox_dimension)
    fis_resolution = f"{resolution}m"
    exact_date = get_exact_date(
        from_time, to_time, bbox, data_collection, evalscript, layer_fis, fis_resolution, config
    )

    if exact_date is None:
        print("Couldn't detect volcano activity. Using event date.")
        exact_date = date

    try:
        before_date_s2, after_date_s2 = get_visualization_dates(
            bbox,
            iso_to_datetime(exact_date),
            DataCollection.SENTINEL2_L1C,
            TIMERANGE_BEFORE,
            TIMERANGE_AFTER,
            MAX_CLOUD_COVERAGE_SEARCH,
            cloud_coverage_evalscript,
            visualization_dates_fis_layer,
            cloud_coverage_fis_resolution,
            MAX_CLOUD_COVERAGE_VISUALIZATION,
            MIN_COVERAGE,
            config,
        )
    except Exception as e:
        raise add_to_exception_message("Error when getting visualization dates: ", e)

    visualization_dates = construct_visualization_dates_wildfires(exact_date, before_date_s2, after_date_s2)

    return lat, lng, default_zoom, exact_date, visualization_dates
