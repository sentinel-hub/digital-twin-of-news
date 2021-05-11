from sentinelhub import DataCollection

from processing.evalscripts import (
    wildfire_detection,
    cloud_mask,
    volcano_detection,
    water_detection,
    water_mask,
    water_mask_s3_olci,
    water_detection_s3_olci,
    ndvi_fis_evalscript,
    ndvi_evalscript,
)


wildfires_settings = {
    "timerange_before": 30,
    "bbox_dimension": 150000,
    "data_collection": DataCollection.SENTINEL3_SLSTR,
    "evalscript": wildfire_detection,
    "layer_fis": "HIGH-TEMPERATURE-DETECTION",
    "resolution": 1000,
    "data_collection_url": "https://creodias.sentinel-hub.com/api/v1/process",
    "LIMIT_INCLUDED": 0.8,
    "LIMIT_SCORE": 0.3,
}

sentinel_2_visualization_settings_wildfires = {
    "TIMERANGE_BEFORE": 50,
    "TIMERANGE_AFTER": 50,
    "MAX_CLOUD_COVERAGE_SEARCH": 0.5,
    "MAX_CLOUD_COVERAGE_VISUALIZATION": 0.4,
    "MIN_COVERAGE": 0.7,
    "cloud_coverage_evalscript": cloud_mask,
    "visualization_dates_layer": "TRUE-COLOR",
    "cloud_coverage_fis_resolution": "20m",
}

volcanoes_settings = {
    "timerange_before": 20,
    "bbox_dimension": 150000,
    "data_collection": DataCollection.SENTINEL3_SLSTR,
    "evalscript": volcano_detection,
    "layer_fis": "HIGH-TEMPERATURE-DETECTION",
    "resolution": 1000,
    "data_collection_url": "https://creodias.sentinel-hub.com/api/v1/process",
    "LIMIT_INCLUDED": 0.8,
    "LIMIT_SCORE": 0.3,
    ### volcano specific
    "bbox_dimension_for_exact_location": 40000,
    "default_zoom": 14,
}

sentinel_2_visualization_settings_volcanoes = {
    "TIMERANGE_BEFORE": 50,
    "TIMERANGE_AFTER": 20,
    "MAX_CLOUD_COVERAGE_SEARCH": 0.8,
    "MAX_CLOUD_COVERAGE_VISUALIZATION": 0.7,
    "MIN_COVERAGE": 0.7,
    "cloud_coverage_evalscript": cloud_mask,
    "visualization_dates_layer": "TRUE-COLOR",
    "cloud_coverage_fis_resolution": "20m",
}

floods_settings = {
    "bbox_dimension": 150000,
    "evalscript_water_mask": water_mask,
    "EVENT_DURATION": 15,  # Default duration of the event in days (to determine timerange for watermask and event)
    "WATER_MASK_TIMERANGE_LENGTH": 30,  # Length of the watermask timerange in days
    "data_collection": DataCollection.SENTINEL1_IW,
    "evalscript": water_detection,
    "resolution": 100,
    "minimum_flooded_area": 5000000,  # Minimum area of the flooding in square meters
    "data_collection_url": "https://services.sentinel-hub.com/api/v1/process",
    "LIMIT_INCLUDED": 0.8,
    "LIMIT_SCORE": 0.7,
    "evalscript_water_mask_s3_olci": water_mask_s3_olci,
    "evalscript_water_detection_s3_olci": water_detection_s3_olci,
    "WATER_MASK_DIFFERENCE_LIMIT": 0.1,
    "MAX_S3_CC": 0.1,
    "S3_WATER_MASK_TIMERANGE_LENGTH": 30,
    "S3_EVENT_DURATION": 15,
    "s3_resolution": 300,
}

visualization_settings_floods = {
    "TIMERANGE_BEFORE": 50,
    "TIMERANGE_AFTER": 20,
    "TIMERANGE_AFTER_S1": 40,
    "VISUALIZATION_EVENT_DATE_OFFSET": 7,
    "MAX_CLOUD_COVERAGE_SEARCH": 0.8,
    "MAX_CLOUD_COVERAGE_VISUALIZATION": 0.7,
    "MIN_COVERAGE": 0.7,
    "cloud_coverage_evalscript": cloud_mask,
    "visualization_dates_layer": "TRUE-COLOR",
    "cloud_coverage_fis_resolution": "100m",
}

droughts_settings = {
    "bbox_dimension": 150000,
    "FIS_DATE_START": "2015-06-27",
    "FIS_MAXCC": 0.5,
    "data_collection": DataCollection.SENTINEL2_L1C,
    "ndvi_fis_evalscript": ndvi_fis_evalscript,
    "ndvi_evalscript": ndvi_evalscript,
    "resolution": 100,
    "fis_layer": "1_TRUE_COLOR",
    "n_year_segments": 12,
    "data_collection_url": "https://services.sentinel-hub.com/api/v1/process",
    "LIMIT_INCLUDED": 0.3,
    "LIMIT_SIZE": 400,
    "LIMIT_SCORE": 1,
    "MAX_EVENT_OFFSET": 1,
}

visualization_settings_droughts = {}
