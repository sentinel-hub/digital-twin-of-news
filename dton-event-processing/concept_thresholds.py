volcano_thresholds = [
    {"uri": "http://en.wikipedia.org/wiki/Volcano", "score_threshold": 90},
    {
        "uri": "http://en.wikipedia.org/wiki/Volcanic_ash",
        "score_threshold": 20,
        "allow_not_exist": True,
    },
]

wildfire_thresholds = [
    {"uri": "http://en.wikipedia.org/wiki/Wildfire", "score_threshold": 90},
]

droughts_thresholds = [
    {"uri": "http://en.wikipedia.org/wiki/Drought", "score_threshold": 80},
]

air_pollution_thresholds = [
    {"uri": "http://en.wikipedia.org/wiki/Air_quality_index", "score_threshold": 80},
]

air_pollution_thresholds_widfires = [
    {"uri": "http://en.wikipedia.org/wiki/Air_pollution", "score_threshold": 90},
    {
        "uri": "http://en.wikipedia.org/wiki/Wildfire",
        "score_threshold": 70,
        "allow_not_exist": True,
    },
]
