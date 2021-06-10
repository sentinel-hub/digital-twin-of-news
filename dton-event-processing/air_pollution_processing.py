from datetime import timedelta
from pprint import pprint

from sentinelhub.time_utils import iso_to_datetime
from sentinelhub import FisRequest, CustomUrlParam, MimeType
import numpy as np

from utils import add_message_to_exception
from processing.date_utils import start_of_day, end_of_day
from processing.bbox_utils import (
    create_bbox,
    zoom_to_fit_bbox,
    get_lat_lng_from_bbox,
    calculate_bbox_dimensions,
)

from processing.fetching_utils import get_image
from processing.pinpoint_location import get_bbox
from processing.fis_utils import (
    get_average_for_period,
    get_max_value_for_period,
    get_first_average_date,
    get_max_n_day_average_for_period,
)


def process_air_pollution_event(event, settings, visualization_settings, config, verbose=False):
    bbox_dimension = settings["bbox_dimension"]
    data_collection = settings["data_collection"]
    evalscript = settings["evalscript"]
    gases = settings["gases"]
    fis_resolution = settings["fis_resolution"]
    fis_layer = settings["fis_layer"]
    fis_evalscript = settings["fis_evalscript"]
    image_resolution = settings["image_resolution"]
    data_collection_url = settings["data_collection_url"]

    LIMIT_INCLUDED = settings["LIMIT_INCLUDED"]
    LIMIT_SCORE = settings["LIMIT_SCORE"]
    EVENT_DURATION = settings["EVENT_DURATION"]
    CALIBRATION_PERIOD_DURATION = settings["CALIBRATION_PERIOD_DURATION"]
    CHANGE_CUTOFF = settings["CHANGE_CUTOFF"]
    MAX_CHANGE_PERCENTAGE_CUTOFF = settings["MAX_CHANGE_PERCENTAGE_CUTOFF"]
    N_DAY_MEAN = settings["N_DAY_MEAN"]

    lat = event["lat"]
    lng = event["lng"]
    bbox = create_bbox(lat, lng, bbox_dimension)

    width = height = int(bbox_dimension / fis_resolution)

    event_date = iso_to_datetime(event["date"])
    from_time_event_range = start_of_day(event_date - timedelta(days=EVENT_DURATION))
    to_time_event_range = end_of_day(event_date + timedelta(days=1))

    from_time_calibration_period = start_of_day(
        event_date - timedelta(days=EVENT_DURATION + CALIBRATION_PERIOD_DURATION + 1)
    )
    to_time_calibration_period = end_of_day(event_date - timedelta(days=EVENT_DURATION + 1))

    fis_resolution = f"{fis_resolution}m"

    config.download_timeout_seconds = 600

    products_with_change = []

    product_specific_visualization_dates = {}
    for product in gases:
        fis_request = FisRequest(
            data_collection=data_collection,
            layer=fis_layer,
            geometry_list=[bbox],
            time=(from_time_calibration_period, to_time_calibration_period),
            resolution=fis_resolution,
            custom_url_params={CustomUrlParam.EVALSCRIPT: fis_evalscript(product)},
            config=config,
        )
        fis_data_before = fis_request.get_data()
        average_value = get_average_for_period(fis_data_before)

        fis_request = FisRequest(
            data_collection=data_collection,
            layer=fis_layer,
            geometry_list=[bbox],
            time=(from_time_event_range, to_time_event_range),
            resolution=fis_resolution,
            custom_url_params={CustomUrlParam.EVALSCRIPT: fis_evalscript(product)},
            config=config,
        )
        fis_data = fis_request.get_data()

        max_value, date = get_max_n_day_average_for_period(fis_data, N_DAY_MEAN)

        if max_value is None or np.isnan(average_value):
            continue

        change = (max_value - average_value) / abs(average_value)

        if change >= CHANGE_CUTOFF:
            products_with_change.append(
                {
                    "product": product,
                    "date": iso_to_datetime(date),
                    "average": average_value,
                    "cutoff": MAX_CHANGE_PERCENTAGE_CUTOFF * change,
                    "max_change": change,
                }
            )
            before_date = get_first_average_date(fis_data_before, average_value)
            product_specific_visualization_dates[product] = {
                "before": before_date,
                "after": date,
            }

        print(
            f"Product: {product}\nAverage: {average_value}\nMax value: {max_value}\nChange: {change}\nDetected significant change: {change >= CHANGE_CUTOFF}\n---------------\n"
        )

    if len(products_with_change) == 0:
        raise Exception("No significant increase has been detected for any product.")

    image_width = image_height = int(bbox_dimension / image_resolution)
    full_image = np.zeros((image_height, image_width))

    for product in products_with_change:
        from_time = start_of_day(product["date"])
        to_time = end_of_day(product["date"])
        image = get_image(
            bbox,
            from_time,
            to_time,
            image_width,
            image_height,
            evalscript(product),
            data_collection,
            data_collection_url,
            config,
            mimetype=MimeType.TIFF,
        )
        product["image"] = image
        full_image += image

    if verbose:
        import matplotlib.pyplot as plt

        plt.rcParams["figure.figsize"] = [36, 24]
        n_products = len(products_with_change) + 1

        vmax = max([np.max(p["image"]) for p in products_with_change])

        fig, axs = plt.subplots(n_products)
        for i, product in enumerate(products_with_change):
            axs[i].set_title(product["product"], size=40)
            axs[i].imshow(product["image"], interpolation="none", vmax=vmax)

        axs[n_products - 1].set_title("Full image", size=40)
        axs[n_products - 1].imshow(full_image, interpolation="none", vmax=vmax)

    try:
        refined_bbox = get_bbox(
            image,
            bbox,
            LIMIT_INCLUDED,
            LIMIT_SCORE,
            sizes_as_weights=True,
            verbose=verbose,
        )
        if refined_bbox is None:
            raise Exception("Failed to find a bbox")
        zoom = zoom_to_fit_bbox(refined_bbox)

        width, height = calculate_bbox_dimensions(refined_bbox)

    except Exception as e:
        raise add_message_to_exception("Error when refining bbox: ", e)

    _, first_product_dates = list(product_specific_visualization_dates.items())[0]
    visualization_dates = {
        "CRE_S5PL2": {
            "before": first_product_dates["before"],
            "after": first_product_dates["after"],
            "productSpecificDates": product_specific_visualization_dates,
        },
    }
    lat, lng = get_lat_lng_from_bbox(refined_bbox)
    return lat, lng, zoom, event["date"], visualization_dates
