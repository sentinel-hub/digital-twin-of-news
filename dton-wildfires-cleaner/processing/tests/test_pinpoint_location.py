import json
import os, sys

sys.path.append(".")

import pytest
import numpy as np

from sentinelhub import SHConfig

from processing.bbox_utils import create_bbox
from processing.pinpoint_location import get_bbox

FIXTURES_FOLDER = os.path.join(os.path.dirname(__file__), "fixtures")

config = SHConfig()
config.instance_id = "INSTANCE_ID"


def load_image(filename):
    filename = os.path.join(FIXTURES_FOLDER, filename)
    return np.load(filename)


@pytest.mark.parametrize(
    "image_filename,lat,lng,bbox_dimension,limit_included,limit_score,expected_refined_bbox",
    [
        (
            "get_bbox_image1.npy",
            -25.25028,
            153.16695,
            150000,
            0.8,
            0.3,
            (153.0079394411468, -25.27724579749874, 153.11725920035838, -25.12443961167254),
        ),
    ],
)
def test_get_exact_date(image_filename, lat, lng, bbox_dimension, limit_included, limit_score, expected_refined_bbox):
    image = load_image(image_filename)
    bbox = create_bbox(lat, lng, bbox_dimension)
    refined_bbox = get_bbox(image, bbox, limit_included, limit_score)
    assert refined_bbox == expected_refined_bbox
