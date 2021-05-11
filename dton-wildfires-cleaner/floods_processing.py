from datetime import timedelta

from sentinelhub.time_utils import iso_to_datetime
from sentinelhub import DataCollection, BBox, CRS
import numpy as np

from utils import add_message_to_exception
from processing.date_utils import start_of_day, end_of_day, get_visualization_dates
from processing.bbox_utils import create_bbox, zoom_to_fit_bbox, get_lat_lng_from_bbox, calculate_bbox_dimensions

from processing.fetching_utils import get_image
from processing.pinpoint_location import get_bbox


def construct_visualization_dates_floods(before_date_s1, after_date_s1, before_date_s2, after_date_s2):
    return {
        "AWS_S2L2A": {"before": before_date_s2, "after": after_date_s2},
        "AWS_S2L1C": {"before": before_date_s2, "after": after_date_s2},
        "AWSEU_S1GRD": {"before": before_date_s1, "after": after_date_s1},
    }


def process_flood_event(event, settings, visualization_settings, config, verbose=False):
    bbox_dimension = settings["bbox_dimension"]
    data_collection = settings["data_collection"]
    evalscript = settings["evalscript"]
    evalscript_water_mask = settings["evalscript_water_mask"]
    resolution = settings["resolution"]
    minimum_flooded_area = settings["minimum_flooded_area"]
    data_collection_url = settings["data_collection_url"]
    evalscript_water_mask_s3_olci = settings["evalscript_water_mask_s3_olci"]
    evalscript_water_detection_s3_olci = settings["evalscript_water_detection_s3_olci"]
    s3_resolution = settings["s3_resolution"]

    LIMIT_INCLUDED = settings["LIMIT_INCLUDED"]
    LIMIT_SCORE = settings["LIMIT_SCORE"]
    EVENT_DURATION = settings["EVENT_DURATION"]
    WATER_MASK_TIMERANGE_LENGTH = settings["WATER_MASK_TIMERANGE_LENGTH"]
    WATER_MASK_DIFFERENCE_LIMIT = settings["WATER_MASK_DIFFERENCE_LIMIT"]
    MAX_S3_CC = settings["MAX_S3_CC"]
    S3_WATER_MASK_TIMERANGE_LENGTH = settings["WATER_MASK_TIMERANGE_LENGTH"]
    S3_EVENT_DURATION = settings["S3_EVENT_DURATION"]

    TIMERANGE_BEFORE = visualization_settings["TIMERANGE_BEFORE"]
    TIMERANGE_AFTER = visualization_settings["TIMERANGE_AFTER"]
    TIMERANGE_AFTER_S1 = visualization_settings["TIMERANGE_AFTER_S1"]
    MAX_CLOUD_COVERAGE_SEARCH = visualization_settings["MAX_CLOUD_COVERAGE_SEARCH"]
    MAX_CLOUD_COVERAGE_VISUALIZATION = visualization_settings["MAX_CLOUD_COVERAGE_VISUALIZATION"]
    MIN_COVERAGE = visualization_settings["MIN_COVERAGE"]
    cloud_coverage_evalscript = visualization_settings["cloud_coverage_evalscript"]
    visualization_dates_fis_layer = visualization_settings["visualization_dates_layer"]
    cloud_coverage_fis_resolution = visualization_settings["cloud_coverage_fis_resolution"]
    VISUALIZATION_EVENT_DATE_OFFSET = visualization_settings["VISUALIZATION_EVENT_DATE_OFFSET"]

    lat = event["lat"]
    lng = event["lng"]
    bbox = create_bbox(lat, lng, bbox_dimension)

    width = height = int(bbox_dimension / resolution)
    s3_s1_resolution_ratio = s3_resolution / resolution

    event_date = iso_to_datetime(event["date"])
    from_time_water_mask = start_of_day(event_date - timedelta(days=(EVENT_DURATION + WATER_MASK_TIMERANGE_LENGTH + 1)))
    to_time_water_mask = end_of_day(event_date - timedelta(days=(EVENT_DURATION + 1)))

    processing_options = {"backCoeff": "GAMMA0_TERRAIN", "demInstance": "COPERNICUS", "orthorectify": True}

    print("Fetching water masks ...")
    water_mask = get_image(
        bbox,
        from_time_water_mask,
        to_time_water_mask,
        width,
        height,
        evalscript_water_mask,
        data_collection,
        data_collection_url,
        config,
        processing_options,
    )

    print("Fetched sentinel-1 water mask")

    config.download_timeout_seconds = 600
    from_time_water_mask_s3 = start_of_day(
        event_date - timedelta(days=(EVENT_DURATION + S3_WATER_MASK_TIMERANGE_LENGTH + 1))
    )

    water_mask_s3_olci = get_image(
        bbox,
        from_time_water_mask_s3,
        to_time_water_mask,
        width // s3_s1_resolution_ratio,
        height // s3_s1_resolution_ratio,
        evalscript_water_mask_s3_olci,
        DataCollection.SENTINEL3_OLCI,
        "https://creodias.sentinel-hub.com/api/v1/process",
        config,
    )
    water_mask_s3_olci = water_mask_s3_olci.repeat(s3_s1_resolution_ratio, axis=0).repeat(
        s3_s1_resolution_ratio, axis=1
    )  # Upsampling

    print("Fetched sentinel-3 water mask")

    should_use_s3 = False

    cloud_pixel_value = 128
    n_cloud_pixels = np.sum(water_mask_s3_olci == cloud_pixel_value)
    is_s3_too_cloudy = (n_cloud_pixels / (width * height)) > MAX_S3_CC

    if not is_s3_too_cloudy:
        water_mask_difference = np.logical_xor((water_mask == 0), (water_mask_s3_olci == 0))
        difference_ratio = np.sum(water_mask_difference) / np.sum(water_mask_s3_olci == 0)

        print(f"Difference: {difference_ratio * 100}%")

        if difference_ratio > WATER_MASK_DIFFERENCE_LIMIT:
            print(f"S1 and S3 differ too much ({difference_ratio * 100}%), using sentinel-3.")
            should_use_s3 = True

    if should_use_s3:
        from_time = start_of_day(event_date - timedelta(days=S3_EVENT_DURATION))
        to_time = end_of_day(event_date + timedelta(days=1))
        image = get_image(
            bbox,
            from_time,
            to_time,
            width // s3_s1_resolution_ratio,
            height // s3_s1_resolution_ratio,
            evalscript_water_detection_s3_olci,
            DataCollection.SENTINEL3_OLCI,
            "https://creodias.sentinel-hub.com/api/v1/process",
            config,
        )
        image = image.repeat(s3_s1_resolution_ratio, axis=0).repeat(s3_s1_resolution_ratio, axis=1)  # Upsampling
    else:
        from_time = start_of_day(event_date - timedelta(days=EVENT_DURATION))
        to_time = end_of_day(event_date + timedelta(days=1))
        image = get_image(
            bbox,
            from_time,
            to_time,
            width,
            height,
            evalscript,
            data_collection,
            data_collection_url,
            config,
            processing_options,
        )

    masked = image * water_mask

    if verbose:
        import matplotlib.pyplot as plt

        plt.rcParams["figure.figsize"] = [36, 24]
        fig, axs = plt.subplots(5, 1)
        axs[0].imshow(water_mask, interpolation="none")
        axs[1].imshow(water_mask_s3_olci, interpolation="none")
        axs[2].imshow(image, interpolation="none")
        axs[3].imshow(masked, interpolation="none")
        axs[4].imshow(water_mask_difference, interpolation="none")

    minimum_flooded_area_pixels = minimum_flooded_area / resolution ** 2

    try:
        refined_bbox = get_bbox(
            masked, bbox, LIMIT_INCLUDED, LIMIT_SCORE, limit_size=minimum_flooded_area_pixels, verbose=verbose
        )
        if refined_bbox is None:
            raise Exception("Failed to find a bbox")
        zoom = zoom_to_fit_bbox(refined_bbox)

        width, height = calculate_bbox_dimensions(refined_bbox)

        if width > 50000 or height > 50000:
            zoom += 1
        if width > 100000 or height > 100000:
            zoom += 1

    except Exception as e:
        raise add_message_to_exception("Error when refining bbox: ", e)

    try:
        bbox_from_refined = BBox(refined_bbox, crs=CRS.WGS84)
        visualization_event_date = event_date - timedelta(days=VISUALIZATION_EVENT_DATE_OFFSET)

        before_date_s2, after_date_s2 = get_visualization_dates(
            bbox_from_refined,
            visualization_event_date,
            DataCollection.SENTINEL2_L1C,
            TIMERANGE_BEFORE,
            TIMERANGE_AFTER_S1,
            MAX_CLOUD_COVERAGE_SEARCH,
            cloud_coverage_evalscript,
            visualization_dates_fis_layer,
            cloud_coverage_fis_resolution,
            MAX_CLOUD_COVERAGE_VISUALIZATION,
            MIN_COVERAGE,
            config,
        )
        before_date_s1, after_date_s1 = get_visualization_dates(
            bbox_from_refined,
            visualization_event_date,
            DataCollection.SENTINEL1_IW,
            TIMERANGE_BEFORE,
            TIMERANGE_AFTER,
            1.0,
            None,
            None,
            None,
            None,
            MIN_COVERAGE,
            config,
        )
    except Exception as e:
        raise add_message_to_exception("Error when getting visualization dates: ", e)

    visualization_dates = construct_visualization_dates_floods(
        before_date_s1, after_date_s1, before_date_s2, after_date_s2
    )
    lat, lng = get_lat_lng_from_bbox(refined_bbox)
    return lat, lng, zoom, event["date"], visualization_dates
