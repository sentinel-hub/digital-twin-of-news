from datetime import timedelta

from sentinelhub import FisRequest, CustomUrlParam, WebFeatureService
from sentinelhub.time_utils import iso_to_datetime
from shapely.geometry import asShape
import numpy as np


def get_exact_date(from_time, to_time, bbox, data_collection, evalscript, layer, resolution, config):
    fis_request = FisRequest(
        data_collection=data_collection,
        layer=layer,
        geometry_list=[bbox],
        time=(from_time, to_time),
        resolution=resolution,
        custom_url_params={CustomUrlParam.EVALSCRIPT: evalscript},
        config=config,
    )
    fis_data = fis_request.get_data()

    max_change = 0
    best_date = None
    for data in fis_data[0]["C0"]:
        if data["basicStats"]["mean"] >= max_change and data["basicStats"]["mean"] > 0:
            max_change = data["basicStats"]["mean"]
            best_date = data["date"]
    return best_date


def start_of_day(date):
    return date.replace(hour=0, minute=0, second=0, microsecond=0)


def end_of_day(date):
    return date.replace(hour=23, minute=59, second=59, microsecond=999999)


def get_days_in_timerange(from_time, to_time):
    days = []
    curr_date = from_time

    while curr_date <= to_time:
        date_start = start_of_day(curr_date)
        date_end = end_of_day(curr_date)
        days.append((date_start, date_end))
        curr_date += timedelta(days=1)

    return days


def merge_tiles(tiles):
    curr_date = None
    curr_merged_tile = None
    merged_tiles = []
    for tile in tiles:
        if tile["properties"]["date"] == curr_date:
            if curr_merged_tile is not None:
                merged = asShape(tile["geometry"]).union(curr_merged_tile["geometry"])
                curr_merged_tile["cloudCoverPercentage"] = (
                    curr_merged_tile["geometry"].area * curr_merged_tile["cloudCoverPercentage"]
                    + tile["properties"].get("cloudCoverPercentage", 0)
                ) / merged.area
                curr_merged_tile["geometry"] = merged
            else:
                curr_merged_tile = {}
                curr_merged_tile["geometry"] = asShape(tile["geometry"])
                curr_merged_tile["cloudCoverPercentage"] = tile["properties"].get("cloudCoverPercentage", 0)
        else:
            if curr_merged_tile:
                merged_tiles.append(curr_merged_tile)

            curr_merged_tile = {}
            curr_merged_tile["geometry"] = asShape(tile["geometry"])
            curr_date = tile["properties"]["date"]
            curr_merged_tile["date"] = tile["properties"]["date"]
            curr_merged_tile["cloudCoverPercentage"] = tile["properties"].get("cloudCoverPercentage", 0)

    merged_tiles.append(curr_merged_tile)
    return merged_tiles


def get_tile_score(cloud_coverage, coverage):
    return cloud_coverage * coverage


def get_best_tile(
    tiles, bbox, cc_evalscript, layer, data_collection, resolution, maxx_cc_visualization, min_coverage, config
):
    best_tile = None
    bbox_geometry = bbox.geometry

    if maxx_cc_visualization is None:
        return get_tile_with_best_coverage(tiles, bbox, min_coverage)

    for tile in tiles:
        coverage_area = bbox_geometry.intersection(tile["geometry"]).area
        coverage = coverage_area / bbox_geometry.area

        tile["coverage"] = coverage

        tile_date = iso_to_datetime(tile["date"])
        from_time = start_of_day(tile_date)
        to_time = end_of_day(tile_date)

        fis_request = FisRequest(
            data_collection=data_collection,
            layer=layer,
            geometry_list=[bbox],
            time=(from_time, to_time),
            resolution=resolution,
            custom_url_params={CustomUrlParam.EVALSCRIPT: cc_evalscript},
            config=config,
        )
        fis_data = fis_request.get_data()
        cloud_coverage_percentage = fis_data[0]["C0"][0]["basicStats"]["mean"]
        score = get_tile_score(cloud_coverage_percentage, coverage)

        if cloud_coverage_percentage <= maxx_cc_visualization and coverage >= min_coverage:
            return tile
        elif best_tile == None:
            tile["score"] = score
            best_tile = tile
        elif best_tile["score"] < score:
            tile["score"] = score
            best_tile = tile
    return best_tile


def get_tile_with_best_coverage(tiles, bbox, min_coverage):
    best_tile = None
    bbox_geometry = bbox.geometry

    for tile in tiles:
        coverage_area = bbox_geometry.intersection(tile["geometry"]).area
        coverage = coverage_area / bbox_geometry.area

        if coverage >= min_coverage:
            return tile
        elif best_tile == None:
            tile["coverage"] = coverage
            best_tile = tile
        elif best_tile["coverage"] < coverage:
            tile["coverage"] = coverage
            best_tile = tile
    return best_tile


def get_visualization_dates(
    bbox,
    date,
    data_collection,
    timerange_before,
    timerange_after,
    max_cc,
    cloud_coverage_evalscript,
    layer,
    resolution,
    maxx_cc_visualization,
    min_coverage,
    config,
):
    from_time = date - timedelta(days=timerange_before)
    to_time = date + timedelta(days=timerange_after)
    time_interval_before = (from_time.isoformat(), date.isoformat())
    time_interval_after = (date.isoformat(), to_time.isoformat())

    tiles_before = WebFeatureService(
        bbox, time_interval_before, data_collection=data_collection, maxcc=max_cc, config=config
    )

    tiles_after = WebFeatureService(
        bbox, time_interval_after, data_collection=data_collection, maxcc=max_cc, config=config
    )

    merged_tiles_before = merge_tiles(tiles_before)
    merged_tiles_after = merge_tiles(tiles_after)

    bbox_geometry = bbox.geometry

    best_tile_after = get_best_tile(
        merged_tiles_after[::-1],
        bbox,
        cloud_coverage_evalscript,
        layer,
        data_collection,
        resolution,
        maxx_cc_visualization,
        min_coverage,
        config,
    )
    best_tile_before = get_best_tile(
        merged_tiles_before,
        bbox,
        cloud_coverage_evalscript,
        layer,
        data_collection,
        resolution,
        maxx_cc_visualization,
        min_coverage,
        config,
    )

    return best_tile_before["date"], best_tile_after["date"]
