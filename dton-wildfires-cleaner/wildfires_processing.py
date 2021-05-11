from datetime import timedelta

from sentinelhub.time_utils import iso_to_datetime
from sentinelhub import DataCollection, BBox, CRS

from utils import add_message_to_exception
from processing.date_utils import get_exact_date, start_of_day, end_of_day, get_visualization_dates
from processing.bbox_utils import create_bbox, zoom_to_fit_bbox, get_lat_lng_from_bbox
from processing.fetching_utils import get_image
from processing.pinpoint_location import get_bbox


def construct_visualization_dates_wildfires(exact_date, before_date_s2, after_date_s2):
    return {
        "AWS_S2L2A": {"before": before_date_s2, "after": after_date_s2},
        "AWS_S2L1C": {"before": before_date_s2, "after": after_date_s2},
        "CRE_S3SLSTR": {"before": exact_date, "after": exact_date},
    }


def process_wildfire_event(event, settings, visualization_settings, config):
    timerange_before = settings["timerange_before"]
    bbox_dimension = settings["bbox_dimension"]
    data_collection = settings["data_collection"]
    evalscript = settings["evalscript"]
    layer_fis = settings["layer_fis"]
    resolution = settings["resolution"]
    data_collection_url = settings["data_collection_url"]
    LIMIT_INCLUDED = settings["LIMIT_INCLUDED"]
    LIMIT_SCORE = settings["LIMIT_SCORE"]

    TIMERANGE_BEFORE = visualization_settings["TIMERANGE_BEFORE"]
    TIMERANGE_AFTER = visualization_settings["TIMERANGE_AFTER"]
    MAX_CLOUD_COVERAGE_SEARCH = visualization_settings["MAX_CLOUD_COVERAGE_SEARCH"]
    MAX_CLOUD_COVERAGE_VISUALIZATION = visualization_settings["MAX_CLOUD_COVERAGE_VISUALIZATION"]
    MIN_COVERAGE = visualization_settings["MIN_COVERAGE"]
    cloud_coverage_evalscript = visualization_settings["cloud_coverage_evalscript"]
    visualization_dates_fis_layer = visualization_settings["visualization_dates_layer"]
    cloud_coverage_fis_resolution = visualization_settings["cloud_coverage_fis_resolution"]

    lat = event["lat"]
    lng = event["lng"]
    bbox = create_bbox(lat, lng, bbox_dimension)

    to_time = iso_to_datetime(event["date"])
    from_time = iso_to_datetime(event["date"])
    from_time = from_time - timedelta(days=timerange_before)

    try:
        fis_resolution = f"{resolution}m"
        exact_date = get_exact_date(
            from_time, to_time, bbox, data_collection, evalscript, layer_fis, fis_resolution, config
        )
        if exact_date is None:
            raise Exception("Failed to find an exact date")
    except Exception as e:
        raise add_message_to_exception("Error when fetching dates: ", e)

    print("Exact date", exact_date)

    width = height = int(bbox_dimension / resolution)
    from_time = start_of_day(iso_to_datetime(exact_date))
    to_time = end_of_day(iso_to_datetime(exact_date))

    try:
        image = get_image(
            bbox, from_time, to_time, width, height, evalscript, data_collection, data_collection_url, config
        )
        refined_bbox = get_bbox(image, bbox, LIMIT_INCLUDED, LIMIT_SCORE)
        if refined_bbox is None:
            raise Exception("Failed to find a bbox")
        zoom = zoom_to_fit_bbox(refined_bbox)
    except Exception as e:
        raise add_message_to_exception("Error when refining bbox: ", e)

    try:
        before_date_s2, after_date_s2 = get_visualization_dates(
            BBox(refined_bbox, crs=CRS.WGS84),
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
        raise add_message_to_exception("Error when getting visualization dates: ", e)

    visualization_dates = construct_visualization_dates_wildfires(exact_date, before_date_s2, after_date_s2)
    lat, lng = get_lat_lng_from_bbox(refined_bbox)

    return lat, lng, zoom, exact_date, visualization_dates
