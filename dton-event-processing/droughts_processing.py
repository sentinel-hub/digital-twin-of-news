from datetime import datetime, timedelta

from sentinelhub.time_utils import iso_to_datetime

from utils import add_message_to_exception
from processing.date_utils import start_of_day, end_of_day
from processing.bbox_utils import create_bbox, zoom_to_fit_bbox, get_lat_lng_from_bbox, calculate_bbox_dimensions
from processing.fis_utils import get_best_fis_dates, fetch_FIS_in_chunks
from processing.image_utils import get_difference_of_images

from processing.fetching_utils import get_image
from processing.pinpoint_location import get_bbox


def construct_visualization_dates_droughts(best_before_drought_date, best_drought_date):
    return {
        "AWS_S2L2A": {"before": best_before_drought_date, "after": best_drought_date},
        "AWS_S2L1C": {"before": best_before_drought_date, "after": best_drought_date},
    }


def process_drought_event(event, settings, visualization_settings, config, verbose=False):
    bbox_dimension = settings["bbox_dimension"]
    data_collection = settings["data_collection"]
    ndvi_fis_evalscript = settings["ndvi_fis_evalscript"]
    ndvi_evalscript = settings["ndvi_evalscript"]
    resolution = settings["resolution"]
    fis_layer = settings["fis_layer"]
    data_collection_url = settings["data_collection_url"]
    n_year_segments = settings["n_year_segments"]

    FIS_DATE_START = settings["FIS_DATE_START"]
    FIS_MAXCC = settings["FIS_MAXCC"]
    MAX_EVENT_OFFSET = settings["MAX_EVENT_OFFSET"]
    LIMIT_INCLUDED = settings["LIMIT_INCLUDED"]
    LIMIT_SCORE = settings["LIMIT_SCORE"]
    LIMIT_SIZE = settings["LIMIT_SIZE"]

    lat = event["lat"]
    lng = event["lng"]
    bbox = create_bbox(lat, lng, bbox_dimension)

    width = height = int(bbox_dimension / resolution)

    event_date = iso_to_datetime(event["date"])

    from_time_ndvi = iso_to_datetime(FIS_DATE_START)
    to_time_ndvi = datetime.now()

    fis_resolution = f"{resolution}m"

    print("Fetching FIS data ...")

    config.download_timeout_seconds = 600
    fis_data = fetch_FIS_in_chunks(
        data_collection,
        fis_layer,
        [bbox],
        from_time_ndvi,
        to_time_ndvi,
        fis_resolution,
        ndvi_fis_evalscript,
        FIS_MAXCC,
        1,
        config,
    )

    best_before_drought_date, best_drought_date = get_best_fis_dates(
        event_date, fis_data, n_year_segments, width * height, MAX_EVENT_OFFSET
    )

    print("Fetching images")
    image_before = get_image(
        bbox,
        start_of_day(best_before_drought_date),
        end_of_day(best_before_drought_date),
        width,
        height,
        ndvi_evalscript,
        data_collection,
        data_collection_url,
        config,
    )
    image_during = get_image(
        bbox,
        start_of_day(best_drought_date),
        end_of_day(best_drought_date),
        width,
        height,
        ndvi_evalscript,
        data_collection,
        data_collection_url,
        config,
    )

    features = get_difference_of_images(image_before, image_during)

    if verbose:
        import matplotlib.pyplot as plt

        plt.rcParams["figure.figsize"] = [36, 24]
        fig, axs = plt.subplots(3, 1)
        axs[0].imshow(image_before, interpolation="none")
        axs[1].imshow(image_during, interpolation="none")
        axs[2].imshow(features, interpolation="none")

    try:
        refined_bbox = get_bbox(
            features,
            bbox,
            LIMIT_INCLUDED,
            LIMIT_SCORE,
            limit_size=LIMIT_SIZE,
            sizes_as_weights=True,
            verbose=verbose,
        )
        if refined_bbox is None:
            raise Exception("Failed to find a bbox. No valid features.")
    except Exception as e:
        raise add_message_to_exception("Error when refining bbox: ", e)

    visualization_dates = construct_visualization_dates_droughts(
        best_before_drought_date.strftime("%Y-%m-%d"),
        best_drought_date.strftime("%Y-%m-%d"),
    )
    zoom = zoom_to_fit_bbox(refined_bbox, default_size_pixels=2000)
    lat, lng = get_lat_lng_from_bbox(refined_bbox)

    width, height = calculate_bbox_dimensions(refined_bbox)

    if width > 50000 or height > 50000:
        zoom += 1
    if width > 100000 or height > 100000:
        zoom += 1

    return lat, lng, zoom, event["date"], visualization_dates
