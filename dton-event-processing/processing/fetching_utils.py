from io import BytesIO

from sentinelhub import DownloadRequest, SentinelHubDownloadClient, MimeType, CRS
from sentinelhub.data_collections import OrbitDirection
import requests
from PIL import Image
import numpy as np


def get_image(
    bbox,
    from_date,
    to_date,
    width,
    height,
    evalscript,
    data_collection,
    url,
    config,
    processing_options={},
    mimetype=MimeType.PNG,
):
    request_raw_dict = {
        "input": {
            "bounds": {
                "properties": {"crs": bbox.crs.opengis_string},
                "bbox": list(bbox),
            },
            "data": [
                {
                    "type": data_collection.api_id,
                    "dataFilter": {
                        "timeRange": {
                            "from": from_date.isoformat() + "Z",
                            "to": to_date.isoformat() + "Z",
                        },
                        "mosaickingOrder": "mostRecent",
                        # "orbitDirection": "DESCENDING",
                        "previewMode": "EXTENDED_PREVIEW",
                        "maxCloudCoverage": 100,
                    },
                    "processing": {"view": "NADIR", **processing_options},
                }
            ],
        },
        "output": {
            "width": width,
            "height": height,
            "responses": [{"identifier": "default", "format": {"type": mimetype.get_string()}}],
        },
        "evalscript": evalscript,
    }

    if data_collection.orbit_direction and data_collection.orbit_direction != OrbitDirection.BOTH:
        request_raw_dict["input"]["data"][0]["dataFilter"]["orbitDirection"] = data_collection.orbit_direction

    download_request = DownloadRequest(
        request_type="POST",
        url=url,
        post_values=request_raw_dict,
        data_type=mimetype,
        headers={"content-type": "application/json"},
        use_session=True,
    )

    download_request.raise_if_invalid()

    client = SentinelHubDownloadClient(config=config)
    return client.download(download_request)


def get_ogc_bbox_and_crs(bbox):
    bbox_string = ",".join(map(str, list(bbox)))
    crs = bbox.crs.ogc_string()
    return bbox_string, crs


def effis_request(base_url, from_time, to_time, bbox, layers, width, height):
    bbox_string, crs = get_ogc_bbox_and_crs(bbox)
    request_url = f"{base_url}?service=WMS&request=GetMap&layers={layers}&styles=&format=image/png&transparent=true&version=1.1.1&singletile=false&time={from_time}/{to_time}&width={width}&height={height}&srs={crs}&bbox={bbox_string}"
    r = requests.get(request_url)
    return np.array(Image.open(BytesIO(r.content)))


def get_effis_burnt_areas(bbox, from_time, to_time, width, height, useModis=False):
    base_url = "https://ies-ows.jrc.ec.europa.eu/effis"
    if useModis:
        layers = "modis.ba"
    else:
        layers = "viirs.ba"

    return effis_request(base_url, from_time, to_time, bbox, layers, width, height)


def get_effis_active_fires(bbox, from_time, to_time, width, height, useModis=False):
    base_url = "https://maps.wild-fire.eu/gwis"
    if useModis:
        layers = "modis.hs"
    else:
        layers = "viirs.hs"
    return effis_request(base_url, from_time, to_time, bbox, layers, width, height)
