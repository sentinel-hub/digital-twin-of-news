import math

from sentinelhub import BBox, CRS
from scipy import ndimage


def deg2rad(degrees):
    return math.pi * degrees / 180.0


def rad2deg(radians):
    return 180.0 * radians / math.pi


def WGS84EarthRadius(lat):
    WGS84_a = 6378137.0  # Major semiaxis [m]
    WGS84_b = 6356752.3  # Minor semiaxis [m]
    An = WGS84_a * WGS84_a * math.cos(lat)
    Bn = WGS84_b * WGS84_b * math.sin(lat)
    Ad = WGS84_a * math.cos(lat)
    Bd = WGS84_b * math.sin(lat)
    return math.sqrt((An * An + Bn * Bn) / (Ad * Ad + Bd * Bd))


def create_bbox(lat, lng, bbox_dimension):
    # https://stackoverflow.com/questions/238260/how-to-calculate-the-bounding-box-for-a-given-lat-lng-location
    lat = deg2rad(lat)
    lng = deg2rad(lng)
    half_side = bbox_dimension / 2

    radius = WGS84EarthRadius(lat)
    pradius = radius * math.cos(lat)

    lat_min = lat - half_side / radius
    lat_max = lat + half_side / radius
    lng_min = lng - half_side / pradius
    lng_max = lng + half_side / pradius

    bbox = (rad2deg(lng_min), rad2deg(lat_min), rad2deg(lng_max), rad2deg(lat_max))
    return BBox(bbox, crs=CRS.WGS84)


def coord_slice(minim, maxim, dimension_size, minim_dim, maxim_dim):
    minim_new = minim + (((maxim - minim) * minim_dim) / dimension_size)
    maxim_new = minim + (((maxim - minim) * maxim_dim) / dimension_size)
    return (minim_new, maxim_new)


def get_bbox_from_image(image, original_bbox):
    bbox_slice = ndimage.find_objects(image, 1)[0]

    max_y = bbox_slice[0].start
    min_y = bbox_slice[0].stop
    min_x = bbox_slice[1].start
    max_x = bbox_slice[1].stop
    min_lng, min_lat, max_lng, max_lat = original_bbox

    total_height, total_width = image.shape

    new_lng = coord_slice(min_lng, max_lng, total_width, min_x, max_x)
    new_lat = coord_slice(min_lat, max_lat, total_height, total_height - min_y, total_height - max_y)

    return (new_lng[0], new_lat[0], new_lng[1], new_lat[1]), bbox_slice


def zoom_to_fit_bbox(bbox, default_size_pixels=1000):
    min_lng, min_lat, max_lng, max_lat = bbox
    lat = (min_lat + max_lat) / 2

    full_radius_lat = math.cos(lat * math.pi / 180.0) * 2 * math.pi * 6378137
    full_radius_lng = 2 * math.pi * 6356752.3

    height_bbox_meters = full_radius_lat * (max_lat - min_lat) / 360
    width_bbox_meters = full_radius_lng * (max_lng - min_lng) / 360

    if height_bbox_meters > width_bbox_meters:
        res = height_bbox_meters / default_size_pixels
    else:
        res = width_bbox_meters / default_size_pixels

    zoom_level = math.log2(full_radius_lat / (4 * 256 * res))
    return math.floor(zoom_level)


def get_lat_lng_from_bbox(bbox):
    min_lng, min_lat, max_lng, max_lat = bbox
    lat = (min_lat + max_lat) / 2
    lng = (min_lng + max_lng) / 2
    return lat, lng


def calculate_bbox_dimensions(bbox):
    min_lng, min_lat, max_lng, max_lat = bbox
    lat = (min_lat + max_lat) / 2

    full_radius_lat = math.cos(lat * math.pi / 180.0) * 2 * math.pi * 6378137
    full_radius_lng = 2 * math.pi * 6356752.3

    height_bbox_meters = full_radius_lat * (max_lat - min_lat) / 360
    width_bbox_meters = full_radius_lng * (max_lng - min_lng) / 360
    return width_bbox_meters, height_bbox_meters
