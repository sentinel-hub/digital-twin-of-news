from .classification_utils import (
    find_features,
    filter_small_features,
    create_cleared_image,
    join_close_clusters,
    filter_clusters_by_score,
    filter_clusters_by_size,
    cluster_suitability_heuristic_default,
)
from .bbox_utils import get_bbox_from_image


def get_bbox(
    image,
    bbox,
    limit_included,
    limit_score,
    verbose=False,
    limit_size=None,
    cluster_suitability_heuristic=cluster_suitability_heuristic_default,
    sizes_as_weights=False,
):
    if verbose:
        import matplotlib.pyplot as plt
        import numpy as np

        limit_size_image = 0
        if limit_size is not None:
            limit_size_image = 1

        plt.rcParams["figure.figsize"] = [36, 24]
        fig, axs = plt.subplots(4 + limit_size_image, 1)

    n_features, all_sizes, labelled_array = find_features(image, sizes_as_weights=sizes_as_weights)

    if n_features == 0:
        return None

    clusters_to_keep = filter_small_features(all_sizes, limit_included)

    cleared_image = create_cleared_image(labelled_array, clusters_to_keep)

    if verbose:
        axs[0].imshow(cleared_image, interpolation="none")

    composite_clusters, image_joined_clusters = join_close_clusters(cleared_image, clusters_to_keep, all_sizes)

    if verbose:
        axs[1].imshow(image_joined_clusters, interpolation="none")

    if limit_size is not None:
        image_joined_clusters, composite_clusters, n_clusters_to_keep = filter_clusters_by_size(
            image_joined_clusters, composite_clusters, all_sizes, limit_size=limit_size
        )
        if n_clusters_to_keep == 0:
            return None
        if verbose:
            axs[2].imshow(image_joined_clusters, interpolation="none")

    image_final_clusters = filter_clusters_by_score(
        image_joined_clusters, composite_clusters, all_sizes, limit_score, cluster_suitability_heuristic
    )

    if verbose:
        axs[2 + limit_size_image].imshow(image_final_clusters, interpolation="none")

    refined_bbox, bbox_slice = get_bbox_from_image(image_final_clusters, bbox)

    if verbose:
        bbox_array = np.zeros(image_final_clusters.shape)
        bbox_array[bbox_slice] = 1
        axs[3 + limit_size_image].imshow(bbox_array, interpolation="none")

    return refined_bbox
