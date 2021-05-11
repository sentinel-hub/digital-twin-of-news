import requests


def filter_events_by_concept_thresholds(events, thresholds):
    filtered_events = []

    for event in events:
        meets_thresholds = True
        for threshold in thresholds:
            uri = threshold["uri"]
            score_threshold = threshold["score_threshold"]
            allow_not_exist = threshold.get("allow_not_exist", False)

            results = list(filter(lambda concept: concept["uri"] == uri, event["concepts"]))

            if (len(results) == 0 and allow_not_exist == False) or (
                len(results) > 0 and results[0]["score"] < score_threshold
            ):
                meets_thresholds = False
                break

        if meets_thresholds:
            filtered_events.append(event)

    return filtered_events


def get_locations_from_concepts(concepts, stop_at_type=None):
    """Fetches coordinates from location concepts using MediaWiki API

    Parameters
    ----------
    concepts : list
        List of Event Registry concept dicts with `score`, `label` and `uri` information.
    stop_at_type : None or str, optional
        If it matches the location type from MediaWiki API response, other concepts are skipped.
        Ignored if None. Default is None

    Returns
    -------
    locations : list
        List of concept locations with `uri`, `score`, `type`, `lat`, `lng`.
    """
    wiki_media_api_url = (
        "https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&coprop=type&format=json&titles="
    )
    locations = []

    for concept in concepts:
        if concept["type"] == "loc":
            title = concept["label"]["eng"]
            request_url = wiki_media_api_url + title
            response = requests.get(request_url)
            data = response.json()
            page = list(data["query"]["pages"].keys())[0]
            coordinates = data["query"]["pages"][page].get("coordinates")

            if coordinates is not None:
                coordinates = coordinates[0]
            else:
                continue

            location_type = coordinates.get("type")
            locations.append(
                {
                    "uri": concept["uri"],
                    "score": concept["score"],
                    "type": location_type,
                    "lat": coordinates["lat"],
                    "lng": coordinates["lon"],
                }
            )
            if stop_at_type is not None and location_type == stop_at_type:
                break

    return locations


def filter_events_by_type(events, event_type):
    return list(filter(lambda e: e["type"] == event_type.value, events))
