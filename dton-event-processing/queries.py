wildfires_query = lambda date_start, date_end: {
    "$query": {
        "$and": [
            {"conceptUri": "http://en.wikipedia.org/wiki/Wildfire"},
            {
                "$or": [
                    {"categoryUri": "dmoz/Health/Public_Health_and_Safety/Emergency_Services"},
                    {"categoryUri": "dmoz/Science/Earth_Sciences/Natural_Disasters_and_Hazards"},
                ]
            },
            {
                "dateStart": date_start,
                "dateEnd": date_end,
            },
            {"lang": "eng"},
        ],
        "$not": {
            "$or": [
                {"conceptUri": "http://en.wikipedia.org/wiki/Controlled_burn"},
                {"conceptUri": "http://en.wikipedia.org/wiki/Insurance"},
                {"conceptUri": "http://en.wikipedia.org/wiki/Temperature"},
                {"categoryUri": "news/Technology"},
            ]
        },
    },
}

volcanoes_query = lambda date_start, date_end: {
    "$query": {
        "$and": [
            {
                "$and": [
                    {"conceptUri": "http://en.wikipedia.org/wiki/Volcano"},
                    {
                        "$or": [
                            {"conceptUri": "http://en.wikipedia.org/wiki/Types_of_volcanic_eruptions"},
                            {"conceptUri": "http://en.wikipedia.org/wiki/Volcanic_ash"},
                        ]
                    },
                ]
            },
            {
                "dateStart": date_start,
                "dateEnd": date_end,
            },
            {"lang": "eng"},
        ],
        "$not": {
            "$or": [
                {"conceptUri": "http://en.wikipedia.org/wiki/Archaeology"},
                {"conceptUri": "http://en.wikipedia.org/wiki/Hotspot_(geology)"},
                {"conceptUri": "http://en.wikipedia.org/wiki/Supervolcano"},
                {"conceptUri": "http://en.wikipedia.org/wiki/Tourism"},
                {"conceptUri": "http://en.wikipedia.org/wiki/Lahar"},
            ]
        },
    }
}


floods_query = lambda date_start, date_end: {
    "$query": {
        "$and": [
            {"conceptUri": "http://en.wikipedia.org/wiki/Flood"},
            {"conceptUri": "http://en.wikipedia.org/wiki/Flash_flood"},
            {"categoryUri": "dmoz/Science/Earth_Sciences/Natural_Disasters_and_Hazards"},
            {
                "dateStart": date_start,
                "dateEnd": date_end,
            },
            {"lang": "eng"},
        ],
    }
}


droughts_query = lambda date_start, date_end: {
    "$query": {
        "$and": [
            {"conceptUri": "http://en.wikipedia.org/wiki/Drought"},
            {"categoryUri": "dmoz/Science/Environment/Water_Resources"},
            {
                "dateStart": date_start,
                "dateEnd": date_end,
            },
            {"lang": "eng"},
        ],
        "$not": {
            "$or": [
                {"conceptUri": "http://en.wikipedia.org/wiki/Flood"},
                {"categoryUri": "dmoz/Science/Earth_Sciences/Paleogeography_and_Paleoclimatology"},
                {"categoryUri": "dmoz/Science/Earth_Sciences/Atmospheric_Sciences"},
                {"categoryUri": "dmoz/Society/Philanthropy"},
            ]
        },
    },
}


air_pollution_query = lambda date_start, date_end: {
    "$query": {
        "$and": [
            {"conceptUri": "http://en.wikipedia.org/wiki/Air_pollution"},
            {"conceptUri": "http://en.wikipedia.org/wiki/Air_quality_index"},
            {"categoryUri": "dmoz/Science/Environment/Air_Quality"},
            {
                "dateStart": date_start,
                "dateEnd": date_end,
            },
            {"lang": "eng"},
        ],
        "$not": {
            "$or": [
                {"conceptUri": "http://en.wikipedia.org/wiki/Air_purifier"},
            ]
        },
    },
}

air_pollution_query_wildfires = lambda date_start, date_end: {
    "$query": {
        "$and": [
            {
                "$and": [
                    {"conceptUri": "http://en.wikipedia.org/wiki/Air_pollution"},
                    {
                        "$or": [
                            {"conceptUri": "http://en.wikipedia.org/wiki/Wildfire"},
                            {"conceptUri": "http://en.wikipedia.org/wiki/Bushfires_in_Australia"},
                        ]
                    },
                ]
            },
            {"categoryUri": "dmoz/Science/Environment/Air_Quality"},
            {"dateStart": date_start, "dateEnd": date_end},
            {"lang": "eng"},
        ],
    },
}

air_pollution_query_sandstorms = lambda date_start, date_end: {
    "$query": {
        "$and": [
            {"conceptUri": "http://en.wikipedia.org/wiki/Dust_storm"},
            {"conceptUri": "http://en.wikipedia.org/wiki/Air_pollution"},
            {
                "dateStart": date_start,
                "dateEnd": date_end,
            },
            {"lang": "eng"},
        ],
        "$not": {
            "$or": [
                {"categoryUri": "dmoz/Shopping"},
            ]
        },
    },
}
