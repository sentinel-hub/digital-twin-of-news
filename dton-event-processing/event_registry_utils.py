import requests

from utils import _get_string


class EventRegistry:
    def __init__(self, api_key, use_cache=False):
        self.EVENT_REGISTRY_API_KEY = api_key
        self.MAX_PAGES_LIMIT = 500

        if use_cache:
            import requests_cache

            self.session = requests_cache.CachedSession(
                cache_name="event_registry_cache",
                backend="sqlite",
                allowable_methods=["POST"],
            )
        else:
            self.session = requests.Session()

    def convert_event_format(self, e):
        # location is sometimes not provided or is None:
        if "location" not in e or not e["location"] or "lat" not in e["location"]:
            return None
        return {
            "id": e["uri"],
            "date": e["eventDate"],
            "type": "wildfire",
            "title": _get_string(e["title"]),
            "lat": e["location"]["lat"],
            "lng": e["location"]["long"],
            "locationName": _get_string(e["location"]["label"]),
            "description": _get_string(e["summary"]),
            "articles": [],
            "concepts": e.get("concepts", []),
        }

    def filter_events(self, data):
        events = []

        for e in data["events"]["results"]:
            event = self.convert_event_format(e)
            if event is None:
                continue
            events.append(event)

        return events

    def get_events_from_media_intelligence(self, query, include_event_concepts=False):
        events = []

        payload = {
            "apiKey": self.EVENT_REGISTRY_API_KEY,
            "resultType": "events",
            "eventsSortBy": "date",
            "includeEventConcepts": include_event_concepts,
            "includeLocationGeoLocation": True,
            "eventsCount": 200,
            "query": query,
        }

        for events_page in range(1, self.MAX_PAGES_LIMIT + 1):
            payload["eventsPage"] = events_page
            r = self.session.post("http://eventregistry.org/api/v1/event/getEvents", json=payload)
            j = r.json()

            events.extend(self.filter_events(j))

            n_pages = j["events"]["pages"]
            if n_pages <= events_page:
                break
        else:
            raise Exception(f"Reached pagination limit of {self.MAX_PAGES_LIMIT} pages!")

        return events

    def get_events_from_monitoring(self, topic_uri):
        # https://eventregistry.org/documentation?tab=searchEventsForTopic
        # https://eventregistry.org/documentation?tab=data_models
        data = {
            "apiKey": self.EVENT_REGISTRY_API_KEY,
            "uri": topic_uri,
            "resultType": "events",
            "eventsSortBy": "rel",
            "includeEventConcepts": False,
            "includeLocationGeoLocation": True,
            "maxDaysBack": 600,
            "eventsCount": 50,
        }
        r = self.session.post("https://eventregistry.org/api/v1/event/getEventsForTopicPage", json=data)
        j = r.json()

        return self.filter_events(j)

    def enrich_events_with_articles(self, events):
        result = []
        for event in events:
            articles = self.get_articles_for_event(event["id"])
            result.append(
                {
                    **event,
                    "articles": articles,
                }
            )
        return result

    def get_articles_for_event(self, event_id):
        data = {
            "eventUri": event_id,
            "resultType": "articles",
            "articlesPage": 1,
            "articlesCount": 100,
            "articlesSortBy": "cosSim",
            "includeArticleTitle": True,
            "includeArticleBasicInfo": True,
            "includeArticleLinks": True,
            "apiKey": self.EVENT_REGISTRY_API_KEY,
        }
        r = self.session.post("https://eventregistry.org/api/v1/event/getEvent", json=data)
        r.raise_for_status()
        j = r.json()

        articles = []

        if "articles" in j[event_id]:
            for a in j[event_id]["articles"]["results"]:
                article = {"url": a["url"], "title": a["title"]}

                if a["image"]:
                    article["image"] = a["image"]

                if a["source"]["title"]:
                    article["source"] = a["source"]["title"]

                articles.append(article)

        return articles

    def get_event(self, event_id):
        data = {
            "eventUri": event_id,
            "resultType": "info",
            "includeLocationGeoLocation": True,
            "apiKey": self.EVENT_REGISTRY_API_KEY,
        }
        r = self.session.post("https://eventregistry.org/api/v1/event/getEvent", json=data)
        r.raise_for_status()

        event = r.json()[event_id]["info"]
        return self.convert_event_format(event)
