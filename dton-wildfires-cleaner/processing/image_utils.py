import numpy as np


def get_difference_of_images(image_before, image_after, max_value=255):
    image_before = image_before / max_value
    image_after = image_after / max_value

    values_before = image_before[:, :, 0]
    clouds_before = image_before[:, :, 1]
    data_mask_before = image_before[:, :, 2]
    mask_before = np.logical_or(clouds_before, np.logical_not(data_mask_before))

    values_after = image_after[:, :, 0]
    clouds_after = image_after[:, :, 1]
    data_mask_after = image_after[:, :, 2]
    mask_after = np.logical_or(clouds_after, np.logical_not(data_mask_after))

    mask = np.logical_or(mask_before, mask_after)

    values_before[mask] = 0
    values_after[mask] = 0
    change = values_before - values_after
    change[change <= 0] = 0

    return change
