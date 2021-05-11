from sentinelhub import DownloadRequest, SentinelHubDownloadClient, MimeType, CRS  # , SentinelHubRequest
from sentinelhub.data_collections import OrbitDirection


def get_image(bbox, from_date, to_date, width, height, evalscript, data_collection, url, config, processing_options={}):
    request_raw_dict = {
        "input": {
            "bounds": {"properties": {"crs": bbox.crs.opengis_string}, "bbox": list(bbox)},
            "data": [
                {
                    "type": data_collection.api_id,
                    "dataFilter": {
                        "timeRange": {"from": from_date.isoformat() + "Z", "to": to_date.isoformat() + "Z"},
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
            "responses": [{"identifier": "default", "format": {"type": MimeType.PNG.get_string()}}],
        },
        "evalscript": evalscript,
    }

    if data_collection.orbit_direction and data_collection.orbit_direction != OrbitDirection.BOTH:
        request_raw_dict["input"]["data"][0]["dataFilter"]["orbitDirection"] = data_collection.orbit_direction

    download_request = DownloadRequest(
        request_type="POST",
        url=url,
        post_values=request_raw_dict,
        data_type=MimeType.PNG,
        headers={"content-type": "application/json"},
        use_session=True,
    )

    download_request.raise_if_invalid()

    client = SentinelHubDownloadClient(config=config)
    return client.download(download_request)
