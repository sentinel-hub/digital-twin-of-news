from datetime import timedelta

import numpy as np
from sentinelhub.time_utils import iso_to_datetime


def get_segments(dates, values, timerange_length):
    timerange_value = 0
    timerange_n = 0
    timerange_start = None
    vals = []
    timerange_length = timedelta(days=timerange_length)

    for i, acquisition_date in enumerate(dates):
        if timerange_start is None:
            timerange_value = values[i]
            timerange_n = 1
            timerange_start = acquisition_date
        elif acquisition_date - timerange_start <= timerange_length:
            timerange_value += values[i]
            timerange_n += 1
        else:
            vals.append(timerange_value / timerange_n)
            timerange_start += timerange_length
            timerange_value = values[i]
            timerange_n = 1
    return vals


def get_segment_averages(segments, n_year_segments):
    avg_vals = []

    for i in range(n_year_segments):
        v = segments[i : len(segments) : n_year_segments]
        avg_vals.append(sum(v) / len(v))
    return avg_vals


def get_segment_deviations_from_mean(segments, segment_averages, n_year_segments):
    diffs = []

    for i, v in enumerate(segments):
        diffs.append(v - segment_averages[i % n_year_segments])
    return diffs


def get_recent_below_average_segments(start_segment, diffs, max_offset=0, max_n_segments=1):
    # Returns ordered list of segments with below average values
    # The period must start at most max_offset segments before most recent, otherwise an empty list is returned
    below_average_period = []
    offset = 0
    for i in range(start_segment, 0, -1):
        if diffs[i] < 0 and len(below_average_period) < max_n_segments:
            below_average_period.append(i)
        elif offset < max_offset:
            offset += 1
        else:
            return sorted(below_average_period, key=lambda x: diffs[x])


def get_closest_index_of_date(start_date, cloud_dates):
    lower = 0
    upper = len(cloud_dates) - 1
    while True:
        if lower == upper or lower + 1 == upper:
            break
        ind = (lower + upper) // 2
        if cloud_dates[ind] > start_date:
            upper = ind
        elif cloud_dates[ind] < start_date:
            lower = ind
        else:
            break
    return upper


def date_to_segment(date, period_start, timerange_length):
    return (date - period_start) // timedelta(days=timerange_length)


def find_best_date(start_ind, end_date, cloud_dates, cloud_values, data_mask_values, values, higher_value_best=False):
    print("Date | Cloud coverage | Coverage | Value")
    min_score = 9999
    best_ind = start_ind
    max_value = np.nanmax(values)
    print(max_value)
    for i in range(start_ind, len(cloud_dates)):
        if cloud_dates[i] < end_date:
            print(cloud_dates[i], cloud_values[i], data_mask_values[i], values[i])
            value = values[i]
            if values[i] == "NaN":
                continue
            if higher_value_best:
                value = 1.1 * max_value - value
            score = (100 * cloud_values[i]) ** 2 * 100 * (1 - data_mask_values[i]) * value
            print("Score:", score)
            if score < min_score:
                min_score = score
                best_ind = i
        else:
            return cloud_dates[best_ind]


def index_to_date(index, start_date, timerange_length):
    return start_date + timedelta(days=timerange_length * index)


def get_closest_good_segment(ind, n_year_segments, diffs):
    # Gets closest segment with average or above average value in preceding years
    best_val = -9999
    best_ind = None
    for i in range(ind, 0, -n_year_segments):
        if diffs[i] > 0:
            return i
        if diffs[i] > best_val:
            best_val = diffs[i]
            best_ind = i
    return best_ind


def get_best_fis_dates(date, fis_data, n_year_segments, n_pixels, max_offset):
    data = fis_data[0]["C0"]
    dates = [iso_to_datetime(d["date"]) for d in data][::-1]
    values_full = [d["basicStats"]["mean"] for d in data][::-1]

    invalid_values_indices = [i for i, d in enumerate(values_full) if d == "NaN"]
    values = np.delete(values_full, invalid_values_indices).astype(float)
    dates = np.delete(dates, invalid_values_indices)
    values_full = np.array(values_full).astype(float)

    cloud_data = fis_data[0]["C1"][::-1]
    cloud_dates = [iso_to_datetime(d["date"]) for d in cloud_data]
    cloud_values = [d["basicStats"]["mean"] for d in cloud_data]

    data_mask_data = fis_data[0]["C2"][::-1]
    data_mask_values = [(sum(i["count"] for i in d["histogram"]["bins"])) / (n_pixels) for d in data_mask_data]

    YEAR_LENGTH = 365.25
    timerange_length = YEAR_LENGTH / n_year_segments

    segments = get_segments(dates, values, timerange_length)
    segment_averages = get_segment_averages(segments, n_year_segments)
    segment_deviations = get_segment_deviations_from_mean(segments, segment_averages, n_year_segments)
    start_segment = date_to_segment(date, dates[0], timerange_length)
    recent_below_average_segments = get_recent_below_average_segments(
        start_segment, segment_deviations, max_offset=max_offset, max_n_segments=1
    )

    if len(recent_below_average_segments) == 0:
        raise Exception("No recent below average segments were found.")

    start_date = index_to_date(recent_below_average_segments[0], dates[0], timerange_length)
    end_date = index_to_date(recent_below_average_segments[0] + 1, dates[0], timerange_length)

    start_date_index = get_closest_index_of_date(start_date, cloud_dates)
    best_drought_date = find_best_date(
        start_date_index, end_date, cloud_dates, cloud_values, data_mask_values, values_full, higher_value_best=False
    )

    most_recent_equivalent_above_average_segment = get_closest_good_segment(
        recent_below_average_segments[0], n_year_segments, segment_deviations
    )

    start_date_before = index_to_date(most_recent_equivalent_above_average_segment, dates[0], timerange_length)
    end_date_before = index_to_date(most_recent_equivalent_above_average_segment + 1, dates[0], timerange_length)

    start_date_index = get_closest_index_of_date(start_date_before, cloud_dates)
    best_before_drought_date = find_best_date(
        start_date_index,
        end_date_before,
        cloud_dates,
        cloud_values,
        data_mask_values,
        values_full,
        higher_value_best=True,
    )
    return best_before_drought_date, best_drought_date
