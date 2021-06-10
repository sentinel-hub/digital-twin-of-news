import re
import json
import os, sys

sys.path.append(".")

import pytest
import responses

from sentinelhub import SHConfig, DataCollection, BBox, CRS
from sentinelhub.time_utils import iso_to_datetime

from processing.date_utils import (
    get_exact_date,
    get_visualization_dates,
    start_of_day,
    end_of_day,
)
from processing.bbox_utils import create_bbox
from processing.evalscripts import wildfire_detection, cloud_mask

FIXTURES_FOLDER = os.path.join(os.path.dirname(__file__), "fixtures")

config = SHConfig()
config.instance_id = "INSTANCE_ID"


def get_response_data(filename, as_json=False):
    filename = os.path.join(FIXTURES_FOLDER, filename)
    body = json.load(open(filename, "rb"))
    if as_json:
        body = json.dumps(body)
    return body


def match_date(date):
    date = iso_to_datetime(date)

    def wrapped(r):
        params = json.loads(r)
        constructed_time = f"{start_of_day(date).isoformat()}/{end_of_day(date).isoformat()}"
        if params["time"] == constructed_time:
            return True
        return False

    return wrapped


@responses.activate
@pytest.mark.parametrize(
    "resolution,bbox_dimension,data_collection,evalscript,layer,from_time,to_time,lat,lng,filename,expected_exact_date",
    [
        (
            "1000m",
            150000,
            DataCollection.SENTINEL3_SLSTR,
            wildfire_detection,
            "HIGH-TEMPERATURE-DETECTION",
            "2020-11-02",
            "2020-12-02",
            -25.25028,
            153.16695,
            "get_exact_date_fis_response.json",
            "2020-11-22",
        ),
    ],
)
def test_get_exact_date(
    resolution,
    bbox_dimension,
    data_collection,
    evalscript,
    layer,
    from_time,
    to_time,
    lat,
    lng,
    filename,
    expected_exact_date,
):
    responses.add(
        responses.POST,
        re.compile(r"^.*creodias.sentinel-hub.com/ogc/fis/.*$"),
        json=get_response_data(filename),
        status=200,
    )

    bbox = create_bbox(lat, lng, bbox_dimension)
    exact_date = get_exact_date(from_time, to_time, bbox, data_collection, evalscript, layer, resolution, config)

    assert exact_date == expected_exact_date


@responses.activate
@pytest.mark.parametrize(
    "bbox,exact_date,data_collection,timerange_after,timerange_before,cloud_coverage_evalscript,resolution,layer,MIN_COVERAGE,MAX_CLOUD_COVERAGE_SEARCH,MAX_CLOUD_COVERAGE_VISUALIZATION,wfs_filenames,fis_filenames,expected_before_date,expected_after_date",
    [
        (
            BBox(
                (
                    153.0079394411468,
                    -25.12443961167254,
                    153.11725920035838,
                    -25.27724579749874,
                ),
                crs=CRS.WGS84,
            ),
            iso_to_datetime("2020-11-22"),
            DataCollection.SENTINEL2_L1C,
            30,
            50,
            cloud_mask,
            "20m",
            "TRUE-COLOR",
            0.7,
            0.5,
            0.4,
            [
                "get_visualization_dates_wfs_before.json",
                "get_visualization_dates_wfs_after.json",
            ],
            [
                {
                    "filename": "get_visualization_dates_fis_after.json",
                    "date": "2020-11-30T00:00:00/2020-11-30T23:59:59.999999",
                },
                {
                    "filename": "get_visualization_dates_fis_before1.json",
                    "date": "2020-11-20T00:00:00/2020-11-20T23:59:59.999999",
                },
                {
                    "filename": "get_visualization_dates_fis_before2.json",
                    "date": "2020-11-15T00:00:00/2020-11-15T23:59:59.999999",
                },
            ],
            "2020-11-15",
            "2020-11-30",
        ),
    ],
)
def test_get_visualization_dates(
    bbox,
    exact_date,
    data_collection,
    timerange_after,
    timerange_before,
    cloud_coverage_evalscript,
    resolution,
    layer,
    MIN_COVERAGE,
    MAX_CLOUD_COVERAGE_SEARCH,
    MAX_CLOUD_COVERAGE_VISUALIZATION,
    wfs_filenames,
    fis_filenames,
    expected_before_date,
    expected_after_date,
):

    for filename in wfs_filenames:
        responses.add(
            responses.GET,
            re.compile(r"^.*sentinel-hub.com/ogc/wfs/.*$"),
            json=get_response_data(filename),
            status=200,
        )

    for entry in fis_filenames:
        filename = entry["filename"]
        date = entry["date"]
        responses.add(
            responses.POST,
            re.compile(r"^.*sentinel-hub.com/ogc/fis/.*$"),
            match=[match_date(date)],
            json=get_response_data(filename),
            status=200,
        )

    before_date, after_date = get_visualization_dates(
        bbox,
        exact_date,
        data_collection,
        timerange_before,
        timerange_after,
        MAX_CLOUD_COVERAGE_SEARCH,
        cloud_coverage_evalscript,
        layer,
        resolution,
        MAX_CLOUD_COVERAGE_VISUALIZATION,
        MIN_COVERAGE,
        config,
    )

    assert before_date == expected_before_date
    assert after_date == expected_after_date
