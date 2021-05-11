import os
import numpy as np


def get_env_var(var_name, default=None):
    var = os.environ.get(var_name)
    if not var and default is None:
        raise Exception(f"{var_name} not specified!")
    elif not var and default is not None:
        return default
    return var


def _get_string(loc):
    if "eng" in loc:
        return loc["eng"]
    return list(loc.values())[0]


def plot_image(image, factor=1.0, clip_range=None, **kwargs):
    """
    Utility function for plotting RGB images.
    """
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(15, 15))
    if clip_range is not None:
        ax.imshow(np.clip(image * factor, *clip_range), **kwargs)
    else:
        ax.imshow(image * factor, **kwargs)
    ax.set_xticks([])
    ax.set_yticks([])


def get_events_ids(events):
    return [event["id"] for event in events]


def add_message_to_exception(message, exception):
    return Exception(message + str(exception))


def print_titles(events):
    for event in events:
        print(event["id"] + ":", event["title"])
