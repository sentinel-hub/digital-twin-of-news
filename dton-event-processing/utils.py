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


def generate_EOB_url_sentinel2(lat, lng, zoom, from_time, to_time):
    return f"https://apps.sentinel-hub.com/eo-browser/?zoom={zoom}&lat={lat}&lng={lng}&fromTime={from_time}T00%3A00%3A00.000Z&toTime={to_time}T23%3A59%3A59.999Z&datasetId=S2L1C"
