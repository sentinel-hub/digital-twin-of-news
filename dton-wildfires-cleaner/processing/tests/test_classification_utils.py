import sys

sys.path.append(".")

import pytest
from sentinelhub import BBox, CRS
import numpy as np

from processing.classification_utils import (
    find_features,
    filter_small_features,
    create_cleared_image,
    get_close_clusters_graph,
    find_connected_components,
    get_joined_clusters_array,
    get_composite_clusters_size_and_center,
    clear_clusters_by_score,
    join_close_clusters,
)


@pytest.mark.parametrize(
    "image,expected_n_features, expected_sizes, expected_labelled_array",
    [
        (
            np.array([[1, 0, 0, 0], [0, 0, 1, 1], [0, 1, 0, 1], [0, 1, 1, 0]]),
            2,
            [1, 6],
            np.array([[1, 0, 0, 0], [0, 0, 2, 2], [0, 2, 0, 2], [0, 2, 2, 0]]),
        ),
        (
            np.array([[1, 0, 0, 0], [0, 0, 1, 1], [0, 0, 0, 0], [0, 1, 1, 0]]),
            3,
            [1, 2, 2],
            np.array([[1, 0, 0, 0], [0, 0, 2, 2], [0, 0, 0, 0], [0, 3, 3, 0]]),
        ),
    ],
)
def test_find_features(image, expected_n_features, expected_sizes, expected_labelled_array):
    n_features, sizes, labelled_array = find_features(image)
    assert n_features == expected_n_features
    np.testing.assert_equal(sizes, expected_sizes)
    np.testing.assert_allclose(labelled_array, expected_labelled_array)


@pytest.mark.parametrize(
    "sizes,limit_included,expected_clusters_to_keep",
    [
        ([1, 1, 2, 5, 7, 99], 0.5, [6]),
        ([1, 1, 2, 5, 7, 99], 0.99, [2, 3, 4, 5, 6]),
    ],
)
def test_filter_small_features(sizes, limit_included, expected_clusters_to_keep):
    clusters_to_keep = filter_small_features(sizes, limit_included)
    assert sorted(clusters_to_keep) == sorted(expected_clusters_to_keep)


@pytest.mark.parametrize(
    "labelled_array,clusters_to_keep,expected_cleared_array",
    [
        (
            np.array([[1, 0, 0, 0], [0, 0, 2, 2], [0, 0, 0, 0], [0, 3, 3, 0]]),
            [3],
            np.array([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 3, 3, 0]]),
        ),
        (
            np.array([[1, 0, 0, 0], [0, 0, 2, 0], [3, 0, 0, 0]]),
            [1, 2, 3],
            np.array([[1, 0, 0, 0], [0, 0, 2, 0], [3, 0, 0, 0]]),
        ),
    ],
)
def test_create_cleared_image(labelled_array, clusters_to_keep, expected_cleared_array):
    cleared_array = create_cleared_image(labelled_array, clusters_to_keep)
    np.testing.assert_equal(cleared_array, expected_cleared_array)


@pytest.mark.parametrize(
    "image,clusters_to_keep,sizes,expected_clusters",
    [
        (np.array([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 3, 3, 0]]), [3], [0, 0, 2], {3: []}),
        (np.array([[1, 0, 0, 0], [0, 0, 2, 0], [3, 0, 0, 0]]), [1, 2, 3], [1, 1, 1], {1: [2, 3], 2: [1, 3], 3: [1, 2]}),
    ],
)
def test_get_close_clusters_graph(image, clusters_to_keep, sizes, expected_clusters):
    clusters = get_close_clusters_graph(image, clusters_to_keep, sizes)
    assert clusters == expected_clusters


@pytest.mark.parametrize(
    "graph,expected_components",
    [
        ({3: []}, [[3]]),
        ({1: [], 2: [3], 3: [2]}, [[1], [2, 3]]),
    ],
)
def test_find_connected_components(graph, expected_components):
    components = find_connected_components(graph)
    assert components == expected_components


@pytest.mark.parametrize(
    "array,composite_clusters,expected_joined_clusters_array",
    [
        (
            np.array([[1, 0, 0, 0], [0, 0, 2, 0], [3, 0, 0, 0]]),
            {1: [1, 2, 3]},
            np.array([[1, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0]]),
        ),
        (
            np.array([[1, 1, 2, 3], [1, 0, 2, 4], [3, 4, 1, 0]]),
            {1: [1, 4], 2: [2, 3]},
            np.array([[1, 1, 2, 2], [1, 0, 2, 1], [2, 1, 1, 0]]),
        ),
    ],
)
def test_get_joined_clusters_array(array, composite_clusters, expected_joined_clusters_array):
    joined_clusters_array = get_joined_clusters_array(array, composite_clusters)
    np.testing.assert_equal(joined_clusters_array, expected_joined_clusters_array)


@pytest.mark.parametrize(
    "image,composite_clusters,all_sizes,expected_sizes,expected_centers",
    [
        (
            np.array([[1, 1, 1, 0], [0, 0, 0, 0], [0, 2, 2, 2]]),
            {1: [1, 2, 3], 2: [4, 5]},
            [1, 1, 1, 2, 1],
            {1: 3, 2: 3},
            [(0, 1), (2, 2)],
        ),
    ],
)
def test_get_composite_clusters_size_and_center(image, composite_clusters, all_sizes, expected_sizes, expected_centers):
    sizes, centers = get_composite_clusters_size_and_center(image, composite_clusters, all_sizes)
    assert sizes == expected_sizes
    assert centers == expected_centers


@pytest.mark.parametrize(
    "image,scores,limit_score,expected_image_joined_clusters",
    [
        (
            np.array([[1, 0, 0, 0], [0, 0, 2, 0], [3, 0, 0, 0]]),
            [{"label": 1, "score": 1}, {"label": 2, "score": 10}, {"label": 3, "score": 90}],
            0.5,
            np.array([[0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]]),
        ),
        (
            np.array([[1, 0, 0, 0], [0, 0, 2, 0], [3, 0, 0, 0]]),
            [{"label": 1, "score": 1}, {"label": 2, "score": 10}, {"label": 3, "score": 90}],
            0.99,
            np.array([[0, 0, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0]]),
        ),
    ],
)
def test_clear_clusters_by_score(image, scores, limit_score, expected_image_joined_clusters):
    scores.sort(key=lambda x: x["score"], reverse=True)
    image_joined_clusters = clear_clusters_by_score(image, scores, limit_score)
    np.testing.assert_equal(image_joined_clusters, expected_image_joined_clusters)


@pytest.mark.parametrize(
    "image,clusters_to_keep,all_sizes,expected_composite_clusters,expected_image_joined_clusters",
    [
        (
            np.array([[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 3]]),
            [1, 2, 3],
            [1, 1, 1],
            {1: [1, 3], 2: [2]},
            np.array([[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 1]]),
        ),
    ],
)
def test_join_close_clusters(
    image, clusters_to_keep, all_sizes, expected_composite_clusters, expected_image_joined_clusters
):
    composite_clusters, image_joined_clusters = join_close_clusters(image, clusters_to_keep, all_sizes)
    assert composite_clusters == expected_composite_clusters
    np.testing.assert_equal(image_joined_clusters, expected_image_joined_clusters)
