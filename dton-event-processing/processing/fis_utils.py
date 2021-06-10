from datetime import timedelta

import numpy as np
from sentinelhub.time_utils import iso_to_datetime
from sentinelhub import FisRequest, CustomUrlParam


def get_segments(dates, values, timerange_length):
    timerange_value = 0
    timerange_n = 0
    timerange_start = dates[0]
    vals = []
    timerange_length = timedelta(days=timerange_length)
    dates = [*dates]
    curr_arr_index = 0

    while curr_arr_index < len(dates):
        for i, acquisition_date in enumerate(dates[curr_arr_index:]):
            if acquisition_date - timerange_start <= timerange_length:
                timerange_value += values[i]
                timerange_n += 1
                curr_arr_index += 1
            else:
                break

        if timerange_n > 0:
            vals.append(timerange_value / timerange_n)
        else:
            vals.append(None)

        timerange_start += timerange_length
        timerange_value = 0
        timerange_n = 0
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


def find_best_date(
    start_ind,
    end_date,
    cloud_dates,
    cloud_values,
    data_mask_values,
    values,
    higher_value_best=False,
):
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
        start_date_index,
        end_date,
        cloud_dates,
        cloud_values,
        data_mask_values,
        values_full,
        higher_value_best=False,
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


def fetch_FIS_in_chunks(
    data_collection,
    layer,
    geometry_list,
    from_time,
    to_time,
    resolution,
    evalscript,
    maxcc,
    bins,
    config,
    n_day_interval=100,
):
    full_fis_data = None
    curr_from = from_time

    while curr_from < to_time:
        curr_to = curr_from + timedelta(days=n_day_interval)

        if curr_to > to_time:
            curr_to = to_time

        fis_request = FisRequest(
            data_collection=data_collection,
            layer=layer,
            geometry_list=geometry_list,
            time=(curr_from, curr_to),
            resolution=resolution,
            custom_url_params={CustomUrlParam.EVALSCRIPT: evalscript},
            maxcc=maxcc,
            bins=bins,
            config=config,
        )
        fis_data = fis_request.get_data()

        if full_fis_data is None and len(fis_data[0]) > 0:
            full_fis_data = fis_data
        elif full_fis_data is not None:
            for key in full_fis_data[0]:
                full_fis_data[0][key] = fis_data[0].get(key, []) + full_fis_data[0][key]

        curr_from = curr_to

    return full_fis_data


def get_average_for_period(fis_data):
    data = fis_data[0]["C0"]
    return np.mean([d["basicStats"]["mean"] for d in data if isinstance(d["basicStats"]["mean"], (int, float))])


def get_max_value_for_period(fis_data):
    data = fis_data[0]["C0"]
    data = [d for d in data if isinstance(d["basicStats"]["mean"], (int, float))]
    if len(data) == 0:
        return None, None
    ind = np.argmax([d["basicStats"]["mean"] for d in data])
    return data[ind]["basicStats"]["mean"], data[ind]["date"]


def get_first_average_date(fis_data, average):
    data = fis_data[0]["C0"]
    for day in data:
        if isinstance(day["basicStats"]["mean"], (int, float)) and day["basicStats"]["mean"] <= average:
            return day["date"]


def running_mean(x, N):
    cumsum = np.cumsum(np.insert(x, 0, 0))
    return (cumsum[N:] - cumsum[:-N]) / float(N)


def get_max_n_day_average_for_period(fis_data, n):
    data = fis_data[0]["C0"]
    data = [d for d in data if isinstance(d["basicStats"]["mean"], (int, float))]
    if len(data) < n:
        return get_max_value_for_period(fis_data)
    all_values = [d["basicStats"]["mean"] for d in data]
    running_means = running_mean(all_values, n)
    ind = np.argmax(running_means)
    ind_max = np.argmax(all_values[ind : ind + n])
    return running_means[ind], data[ind_max]["date"]
