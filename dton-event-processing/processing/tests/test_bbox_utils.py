import sys

sys.path.append(".")

import pytest
from sentinelhub import BBox, CRS
import numpy as np

from processing.bbox_utils import create_bbox, get_bbox_from_image, zoom_to_fit_bbox


@pytest.mark.parametrize(
    "lat,lng,bbox_dimension,expected_bbox",
    [
        (
            -25.25028,
            153.16695,
            150000,
            BBox(
                (
                    152.42158800537553,
                    -25.92442493746853,
                    153.9123119946245,
                    -24.576135062531467,
                ),
                crs=CRS.WGS84,
            ),
        ),
    ],
)
def test_create_bbox(lat, lng, bbox_dimension, expected_bbox):
    bbox = create_bbox(lat, lng, bbox_dimension)
    assert bbox == expected_bbox


@pytest.mark.parametrize(
    "image,original_bbox,expected_bbox,expected_slices",
    [
        (
            np.array([[0, 1], [0, 0]]),
            (0, 0, 10, 10),
            (5, 5, 10, 10),
            (slice(0, 1, None), slice(1, 2, None)),
        ),
        (
            np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1]]),
            (12.5, -3, 27.7, 13.2),
            (12.5, -3, 27.7, 13.2),
            (slice(0, 3, None), slice(0, 3, None)),
        ),
    ],
)
def test_get_bbox_from_image(image, original_bbox, expected_bbox, expected_slices):
    bbox, slices = get_bbox_from_image(image, original_bbox)
    np.testing.assert_allclose(bbox, expected_bbox)
    assert slices == expected_slices


@pytest.mark.parametrize(
    "bbox,expected_zoom",
    [
        ((0, 0, 10, 10), 5),  # (7 fits bbox tightly)
        ((10, 50, 10.001, 50.001), 17),  # (19 fits bbox tightly)
    ],
)
def test_zoom_to_fit_bbox(bbox, expected_zoom):
    zoom = zoom_to_fit_bbox(bbox)
    assert zoom == expected_zoom
