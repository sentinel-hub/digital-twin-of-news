import numpy as np


def effis_image_to_array(image):
    # Converts RGBA array to 2D boolean array
    return (np.sum(image, axis=2) > 0).astype(int)


def fire_pixels_from_image(image):
    return np.sum(np.sum(image, axis=2) > 0)


def weighted_fire_pixels_from_image(image):
    # Weighted by the distance from the origin
    shapes = image.shape[:-1]
    x, y = np.indices(shapes)
    x_center, y_center = (np.array(shapes) - 1) / 2
    weights = 1 / np.sqrt((x - x_center) ** 2 + (y - y_center) ** 2)
    fire_pixels = np.sum(image, axis=2) > 0
    return np.sum(weights * fire_pixels)
