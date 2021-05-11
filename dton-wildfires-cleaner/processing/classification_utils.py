import math

from scipy import ndimage
import numpy as np


def find_features(image, sizes_as_weights=False):
    structure = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
    labelled_array, n_features = ndimage.measurements.label(image, structure)
    if sizes_as_weights:
        sizes = ndimage.measurements.sum(image, labelled_array, index=np.arange(1, n_features + 1))
    else:
        sizes = ndimage.measurements.sum((image != 0).astype(int), labelled_array, index=np.arange(1, n_features + 1))
    return n_features, sizes, labelled_array


def filter_small_features(sizes, limit_included, max_n_features=500):
    total_size = sum(sizes)
    sort_indices = np.argsort(sizes)[::-1]
    clusters_to_keep = []
    top_n_sum = 0
    n_features = 0

    for index in sort_indices:
        if top_n_sum / total_size < limit_included and n_features <= max_n_features:
            clusters_to_keep.append(index + 1)
            top_n_sum += sizes[index]
            n_features += 1
        else:
            break

    return clusters_to_keep


def create_cleared_image(labelled_array, clusters_to_keep):
    cleared_array = labelled_array.copy()
    cleared_array[np.reshape(np.in1d(cleared_array, clusters_to_keep, invert=True), cleared_array.shape)] = 0
    return cleared_array


def get_close_clusters_graph(image, clusters_to_keep, sizes):
    RADIUS_EXTRA = 3  # Is other cluster within radius times this number
    clusters = {}
    cluster_centers = ndimage.center_of_mass(image, labels=image, index=clusters_to_keep)

    for i, label_i in enumerate(clusters_to_keep):
        close_clusters = []
        for j, label_j in enumerate(clusters_to_keep):
            if i == j:
                continue
            radius_i = math.sqrt(sizes[label_i - 1] / math.pi)
            radius_j = math.sqrt(sizes[label_j - 1] / math.pi)
            center_x, center_y = cluster_centers[i]
            other_center_x, other_center_y = cluster_centers[j]
            is_within_radius = math.sqrt(
                (other_center_x - center_x) ** 2 + (other_center_y - center_y) ** 2
            ) <= RADIUS_EXTRA * (radius_i + radius_j)

            if is_within_radius:
                close_clusters.append(label_j)

        clusters[label_i] = close_clusters

    return clusters


def dfs(vertices, component, graph, not_visited):
    for vertex in vertices:
        if vertex in not_visited:
            component.append(vertex)
            not_visited.remove(vertex)
            dfs(graph[vertex], component, graph, not_visited)


def find_connected_components(graph):
    not_visited = list(graph.keys())
    components = []

    for vertex, close_vertices in graph.items():
        if vertex in not_visited:
            component = [vertex]
            not_visited.remove(vertex)
            dfs(close_vertices, component, graph, not_visited)
            components.append(component)
    return components


def get_joined_clusters_array(array, composite_clusters):
    joined_clusters_array = array.copy()
    for cluster_label, components in composite_clusters.items():
        joined_clusters_array[np.reshape(np.in1d(array, components), array.shape)] = cluster_label
    return joined_clusters_array


def distance_from_origin(x, y):
    return math.sqrt(x ** 2 + y ** 2)


def cluster_suitability_heuristic_default(distance, size):
    MAX_SCORE = 10000 * size
    if distance == 0:
        return MAX_SCORE
    return min(10000 * size / distance ** 3, MAX_SCORE)


def calculate_scores(composite_clusters, sizes, centers, offset_x, offset_y, cluster_suitability_heuristic):
    scores = []
    for cluster in composite_clusters.keys():
        x, y = centers[cluster - 1]
        x -= offset_x
        y -= offset_y
        distance = distance_from_origin(x, y)
        score = cluster_suitability_heuristic(distance, sizes[cluster])
        scores.append({"label": cluster, "score": score})
    scores.sort(key=lambda x: x["score"], reverse=True)
    return scores


def get_composite_clusters_size_and_center(image, composite_clusters, all_sizes):
    sizes = {}
    centers = ndimage.center_of_mass(image, labels=image, index=list(composite_clusters.keys()))

    for cluster_label, clusters in composite_clusters.items():
        size = sum([all_sizes[cluster - 1] for cluster in clusters])
        sizes[cluster_label] = size
    return sizes, centers


def clear_clusters_by_score(image_joined_clusters, scores, limit_score):
    clusters_to_use_for_bbox = []
    top_n_sum = 0
    index = 0
    total_sum = sum([score["score"] for score in scores])

    while top_n_sum / total_sum < limit_score:
        label = scores[index]["label"]
        clusters_to_use_for_bbox.append(label)
        top_n_sum += scores[index]["score"]
        index += 1

    image_joined_clusters[
        np.reshape(np.in1d(image_joined_clusters, clusters_to_use_for_bbox, invert=True), image_joined_clusters.shape)
    ] = 0
    image_joined_clusters[np.nonzero(image_joined_clusters)] = 1
    return image_joined_clusters


def get_center_offsets(image):
    height, width = image.shape
    offset_x = width / 2
    offset_y = height / 2
    return offset_x, offset_y


def filter_clusters_by_score(
    image_joined_clusters, composite_clusters, all_sizes, limit_score, cluster_suitability_heuristic
):
    sizes, centers = get_composite_clusters_size_and_center(image_joined_clusters, composite_clusters, all_sizes)
    offset_x, offset_y = get_center_offsets(image_joined_clusters)
    scores = calculate_scores(composite_clusters, sizes, centers, offset_x, offset_y, cluster_suitability_heuristic)
    return clear_clusters_by_score(image_joined_clusters, scores, limit_score)


def join_close_clusters(cleared_image, clusters_to_keep, all_sizes):
    graph = get_close_clusters_graph(cleared_image, clusters_to_keep, all_sizes)
    components = find_connected_components(graph)

    composite_clusters = {i: components[i - 1] for i in range(1, len(components) + 1)}

    image_joined_clusters = get_joined_clusters_array(cleared_image, composite_clusters)
    return composite_clusters, image_joined_clusters


def filter_clusters_by_size(image_joined_clusters, composite_clusters, all_sizes, limit_size):
    sizes, _ = get_composite_clusters_size_and_center(image_joined_clusters, composite_clusters, all_sizes)
    n_clusters_to_keep = 0

    for cluster in list(composite_clusters.keys()):
        if sizes[cluster] >= limit_size:
            n_clusters_to_keep += 1
        else:
            composite_clusters[cluster] = []

    return image_joined_clusters, composite_clusters, n_clusters_to_keep
