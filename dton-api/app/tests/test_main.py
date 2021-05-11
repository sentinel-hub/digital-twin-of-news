import logging
import os
import sys

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


DB_HOST = os.environ.get("TESTING_DB_HOST", "localhost")
DB_NAME = "test"
DB_USER = "test"
DB_PASS = "test"
DEFAULT_ZOOM = 13


# before importing anything, manipulate env vars:
os.environ["DB_HOST"] = DB_HOST
os.environ["DB_NAME"] = DB_NAME
os.environ["DB_USER"] = DB_USER
os.environ["DB_PASS"] = DB_PASS
SECRET_API_KEY = "asdf"
os.environ["SECRET_API_KEY"] = SECRET_API_KEY


ADMIN_USERNAME = "test-admin"
ADMIN_KEY = "mysecret"


currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)
from main import app, get_db
from database.database import Base
from crud import migrate_db


# https://fastapi.tiangolo.com/advanced/testing-database/
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
logging.info(f"Creating DB engine (-h {DB_HOST} -d {DB_NAME} -U {DB_USER})")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
_client = TestClient(app)


def _initialize_db():
    # remove everything you find in the database:
    c = engine.execute("SELECT tablename, schemaname FROM pg_tables WHERE schemaname = 'public';")
    results = list(c)
    for tablename, _ in results:
        sql = f"DROP TABLE IF EXISTS {tablename} CASCADE;"
        engine.execute(sql)
    for sql in [
        "DROP TYPE IF EXISTS eventtype;",
        "DROP SEQUENCE IF EXISTS articles_id_seq;",
    ]:
        engine.execute(sql)

    # run migration:
    db = override_get_db()
    migrate_db(db)


@pytest.fixture
def client():
    _initialize_db()
    return _client


@pytest.fixture
def event_id(client):
    event = {
        "id": "eng-123456",
        "type": "wildfire",
        "date": "2017-06-12",
        "locationName": "Locationville",
        "title": "Some wildfire",
        "description": "...",
        "lat": 45.2,
        "lng": 22.321,
        "articles": [],
        "visualizationDates": {},
    }
    response = client.post("/v1/events", json=event, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    assert response.json() == {"id": "eng-123456"}
    return "eng-123456"


@pytest.fixture
def admin_id(client):
    admin = {
        "username": ADMIN_USERNAME,
        "key": ADMIN_KEY,
    }
    response = client.post("/v1/admins", json=admin, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    actual = response.json()
    admin_id = actual["id"]
    return admin_id


##################### TESTS


def test_events_manipulation(client):
    """
    - events list is initially empty
    - we can add an event
      - it is in the list (with "confirmed=null" parameter)
      - we can access it directly
    - we patch the event with different confirmed and overrideConfirmed parameters
      - events list changes accordingly
    - we can patch the event fields
      - changes are visible in the event
    """
    # - events list is initially empty
    response = client.get("/v1/events")
    assert response.status_code == 200
    assert response.json() == []

    # - we can add an event
    #     - it is in the list (with "confirmed=null" parameter)
    #     - we can access it directly
    event = {
        "id": "eng-123456",
        "type": "wildfire",
        "date": "2017-06-12",
        "locationName": "Locationville",
        "title": "Some wildfire",
        "description": "...",
        "lat": 45.2,
        "lng": 22.321,
        "articles": [
            {
                "url": "https://nytimes.com/some-wildfire",
                "title": "no image or source",
            },
            {
                "url": "https://nytimes.com/some-wildfire",
                "title": "Fire",
                "image": "https://nytimes.com/some-wildfire/image-01",
                "source": "some news paper",
            },
        ],
        "visualizationDates": {},
    }

    # returned event contains the articles in the opposite order and they contain `None` for empty fields
    expected_event_base = {
        **event,
        "articles": [event["articles"][1], {**event["articles"][0], "image": None, "source": None}],
    }

    # but we must be authenticated:
    response = client.post("/v1/events", json=event)
    assert response.status_code == 401

    response = client.post("/v1/events", json=event, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    assert response.json() == {"id": "eng-123456"}

    # if we don't specify 'confirmed' query parameter:
    response = client.get("/v1/events")
    assert response.status_code == 200
    assert response.json() == []

    expected_event = {
        **expected_event_base,
        # some fields are added automatically:
        "confirmed": None,
        "overrideConfirmed": None,
        "overrideLat": None,
        "overrideLng": None,
        "overrideVisualizationDates": {},
        "overrideZoom": None,
        "visualizationDates": {},
        "zoom": DEFAULT_ZOOM,
    }
    expected_event_within_events = {**expected_event}
    for unwanted in ["articles", "visualizationDates", "overrideVisualizationDates"]:
        del expected_event_within_events[unwanted]

    response = client.get("/v1/events?confirmed=all")
    assert response.status_code == 200
    # update the expected event data with the time of creation - it is different every time we run the test:
    expected_event["created"] = response.json()[0]["created"]
    expected_event_within_events["created"] = response.json()[0]["created"]
    assert response.json() == [expected_event_within_events]

    # - we patch the event with different confirmed and overrideConfirmed parameters
    #     - events list changes accordingly
    response = client.patch("/v1/events/eng-123456", json={"confirmed": True})
    assert response.status_code == 401

    response = client.patch("/v1/events/eng-123456", json={"confirmed": True}, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    response = client.get("/v1/events?confirmed=true_overriden")
    assert response.status_code == 200
    assert response.json() == [
        {
            **expected_event_within_events,
            "confirmed": True,
        }
    ]
    # until we override the event manually, it is not visible by default:
    response = client.get("/v1/events")
    assert response.status_code == 200
    assert response.json() == []

    response = client.patch("/v1/events/eng-123456", json={"confirmed": False}, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    response = client.get("/v1/events")
    assert response.status_code == 200
    assert response.json() == []

    response = client.patch(
        "/v1/events/eng-123456/override", json={"overrideConfirmed": False}, headers={"x-api-key": SECRET_API_KEY}
    )
    assert response.status_code == 200
    response = client.get("/v1/events")
    assert response.status_code == 200
    assert response.json() == []

    response = client.patch(
        "/v1/events/eng-123456/override", json={"overrideConfirmed": True}, headers={"x-api-key": SECRET_API_KEY}
    )
    assert response.status_code == 200
    response = client.get("/v1/events")
    assert response.status_code == 200
    assert response.json() == [
        {
            **expected_event_within_events,
            "confirmed": False,
            "overrideConfirmed": True,
        }
    ]

    response = client.patch(
        "/v1/events/eng-123456/override", json={"overrideConfirmed": None}, headers={"x-api-key": SECRET_API_KEY}
    )
    assert response.status_code == 200
    response = client.get("/v1/events")
    assert response.status_code == 200
    assert response.json() == []

    # - we can patch the event fields
    #     - changes are visible in the event
    patch = {
        "lat": 41.2,
        "lng": 20.321,
        "zoom": 11,
        "confirmed": True,
        "visualizationDates": {
            "CRE_S3SLSTR": {
                "before": "2000-01-01",
                "after": "2000-02-01",
            },
        },
    }
    response = client.patch("/v1/events/eng-123456", json=patch, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    response = client.get("/v1/events?confirmed=all")
    assert response.status_code == 200
    expected = {
        **expected_event_within_events,
        **patch,
    }
    del expected["visualizationDates"]
    assert response.json() == [expected]

    response = client.get("/v1/events/eng-123456")
    assert response.status_code == 200
    assert response.json() == {
        **expected_event,
        **patch,
    }


def test_admins(client, event_id):
    """
    - the list of admins is initially empty
    - we create admin user
      - admin is in the list of admins
      - we can't delete events with admin
      - we can patch event's override params with admin
    - we change admin user's key
      - we can patch event only with admin's new key
    - we remove admin user
      - in the list admin is missing
    """
    response = client.get("/v1/admins")
    assert response.status_code == 401

    response = client.get("/v1/admins", headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    assert response.json() == []

    # - we create admin user
    #   - admin is in the list of admins
    #   - we can patch event with admin
    #   - we can patch event with superadmin
    #   - we can't delete events with admin
    ADMIN_KEY = "mysecret"
    admin = {
        "username": "test-admin",
        "key": ADMIN_KEY,
    }
    response = client.post("/v1/admins", json=admin)
    assert response.status_code == 401

    response = client.post("/v1/admins", json=admin, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200

    response = client.post("/v1/admins", json=admin, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 409  # admin already exists

    response = client.get("/v1/admins", headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    actual = response.json()
    admin_id = actual[0]["id"]
    assert actual == [
        {
            **admin,
            "id": admin_id,
            "created": actual[0]["created"],
            "enabled": True,
        }
    ]

    # we can't do everything:
    response = client.patch(f"/v1/events/{event_id}", json={"confirmed": None}, headers={"x-api-key": ADMIN_KEY})
    assert response.status_code == 401
    response = client.delete(f"/v1/events/{event_id}", headers={"x-api-key": ADMIN_KEY})
    assert response.status_code == 401

    # but we can patch through /override endpoint:
    response = client.patch(
        f"/v1/events/{event_id}/override", json={"overrideConfirmed": None}, headers={"x-api-key": ADMIN_KEY}
    )
    assert response.status_code == 200

    # - we change admin user's key
    #   - we can patch event only with admin's new key
    ADMIN_KEY2 = "myanothersecret"
    patch = {
        "key": ADMIN_KEY2,
    }
    response = client.patch(f"/v1/admins/{admin_id}", json=patch, headers={"x-api-key": ADMIN_KEY})
    assert response.status_code == 401
    response = client.patch(f"/v1/admins/{admin_id}", json=patch, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200

    response = client.patch(
        f"/v1/events/{event_id}/override", json={"overrideConfirmed": None}, headers={"x-api-key": ADMIN_KEY}
    )
    assert response.status_code == 401
    response = client.patch(
        f"/v1/events/{event_id}/override", json={"overrideConfirmed": None}, headers={"x-api-key": ADMIN_KEY2}
    )
    assert response.status_code == 200
    # set key back to ADMIN_KEY:
    response = client.patch(f"/v1/admins/{admin_id}", json={"key": ADMIN_KEY}, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    response = client.patch(
        f"/v1/events/{event_id}/override", json={"overrideConfirmed": None}, headers={"x-api-key": ADMIN_KEY}
    )
    assert response.status_code == 200

    # - we remove admin user
    #   - in the list admin is missing
    response = client.delete(f"/v1/admins/{admin_id}", headers={"x-api-key": ADMIN_KEY})
    assert response.status_code == 401
    response = client.delete(f"/v1/admins/{admin_id}")
    assert response.status_code == 401
    response = client.delete(f"/v1/admins/{admin_id}", headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200

    # superadmin can still see the record, though it is marked as disabled:
    response = client.get("/v1/admins", headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    actual = response.json()
    assert actual == [
        {
            **admin,
            "id": admin_id,
            "created": actual[0]["created"],
            "enabled": False,
        }
    ]
    # we can no longer remove the non-existent admin:
    response = client.delete(f"/v1/admins/{admin_id}", headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 404

    # even though it was a "soft delete", admin can no longer override events:
    response = client.patch(
        f"/v1/events/{event_id}/override", json={"overrideConfirmed": None}, headers={"x-api-key": ADMIN_KEY}
    )
    assert response.status_code == 401


def test_audit_trail(client, event_id, admin_id):
    """
    - fetch event - no audit trail
    - fetch event as admin - audit trail empty
    - override event as superadmin with explanation - audit trail has 1 entry
    - override event as superadmin without explanation - audit trail has 2 entries
    - override event as admin with explanation - audit trail has 3 entries
    - fetch event with missing or invalid credentials - no audit trail
    - remove admin - audit trail still has the same entries
    """
    response = client.get(f"/v1/events/{event_id}")
    assert response.status_code == 200
    assert "auditTrail" not in response.json()

    response = client.get(f"/v1/events/{event_id}", headers={"x-api-key": ADMIN_KEY})
    assert response.status_code == 200
    assert response.json()["auditTrail"] == []

    # patch as superadmin, with explanation:
    response = client.patch(
        f"/v1/events/{event_id}/override",
        json={"overrideConfirmed": None, "explanation": "explanation1"},
        headers={"x-api-key": SECRET_API_KEY},
    )
    assert response.status_code == 200
    response = client.get(f"/v1/events/{event_id}", headers={"x-api-key": ADMIN_KEY})
    assert response.status_code == 200
    actual = response.json()
    assert len(actual["auditTrail"]) == 1
    assert actual["auditTrail"][0] == {
        "admin": None,
        "created": actual["auditTrail"][0]["created"],
        "explanation": "explanation1",
        "id": actual["auditTrail"][0]["id"],
    }

    # patch as superadmin, without explanation:
    response = client.patch(
        f"/v1/events/{event_id}/override",
        json={"overrideConfirmed": None},
        headers={"x-api-key": SECRET_API_KEY},
    )
    assert response.status_code == 200
    response = client.get(f"/v1/events/{event_id}", headers={"x-api-key": ADMIN_KEY})
    assert response.status_code == 200
    actual = response.json()
    assert len(actual["auditTrail"]) == 2
    assert actual["auditTrail"][1] == {
        "admin": None,
        "created": actual["auditTrail"][1]["created"],
        "explanation": None,
        "id": actual["auditTrail"][1]["id"],
    }

    # patch as admin, with explanation:
    response = client.patch(
        f"/v1/events/{event_id}/override",
        json={"overrideConfirmed": None, "explanation": "explanation2"},
        headers={"x-api-key": ADMIN_KEY},
    )
    assert response.status_code == 200
    response = client.get(f"/v1/events/{event_id}", headers={"x-api-key": ADMIN_KEY})
    assert response.status_code == 200
    actual = response.json()
    assert len(actual["auditTrail"]) == 3
    assert actual["auditTrail"][2] == {
        "admin": {
            "username": ADMIN_USERNAME,
        },
        "created": actual["auditTrail"][2]["created"],
        "explanation": "explanation2",
        "id": actual["auditTrail"][2]["id"],
    }
    final_audit_trail = actual

    # make sure that fetching with a wrong (or missing) API key returns nothing:
    response = client.get(f"/v1/events/{event_id}", headers={"x-api-key": "some-invalid-key"})
    assert response.status_code == 200
    assert "auditTrail" not in response.json()

    response = client.get(f"/v1/events/{event_id}")
    assert response.status_code == 200
    assert "auditTrail" not in response.json()

    # delete admin, make sure that audit trail is still unchanged:
    response = client.delete(f"/v1/admins/{admin_id}", headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200

    response = client.get(f"/v1/events/{event_id}", headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    actual = response.json()
    assert actual == final_audit_trail


def test_add_volcano_event_and_patch_articles(client):
    event = {
        "id": "spa-123456",
        "type": "volcano",
        "date": "2017-06-12",
        "locationName": "Locationville",
        "title": "Some volcano",
        "description": "...",
        "lat": 45.2,
        "lng": 22.321,
        "articles": [
            {
                "url": "https://nytimes.com/some-volcano",
                "title": "Fire",
                "image": "https://nytimes.com/some-volcano/image-01",
            }
        ],
        "visualizationDates": {},
    }
    response = client.post("/v1/events", json=event, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    assert response.json() == {"id": "spa-123456"}

    response = client.get("/v1/events/spa-123456")
    assert response.status_code == 200
    retrieved_event = response.json()
    assert retrieved_event["type"] == "volcano"

    new_article = {
        "url": "https://srednja-duplica-times.com/some-volcano",
        "title": "Volcano in Srednja Duplica",
        "image": "https://srednja-duplica-times.com/some-volcano/image-01",
        "source": "Srednja Duplica Times",
    }

    response = client.patch(
        "/v1/events/spa-123456", json={"articles": [new_article]}, headers={"x-api-key": SECRET_API_KEY}
    )
    assert response.status_code == 200

    response = client.get("/v1/events/spa-123456")
    assert response.status_code == 200
    retrieved_event = response.json()
    assert len(retrieved_event["articles"]) == 1
    assert new_article in retrieved_event["articles"]


@pytest.mark.parametrize(
    "date_from,date_to,expected_len_events",
    [
        (None, "2017-06-19", 10),
        (None, "2017-06-09", 0),
        (None, "2017-06-10", 1),
        (None, "2017-06-13", 4),
        ("2017-06-19", None, 1),
        ("2017-06-09", None, 10),
        ("2017-06-10", None, 10),
        ("2017-06-11", None, 9),
        ("2017-06-13", None, 7),
        ("2017-06-13", "2017-06-17", 5),
    ],
)
def test_events_date_filtering(client, date_from, date_to, expected_len_events):
    for d in range(10):
        event = {
            "id": f"spa-12345{d}",
            "type": "volcano",
            "date": f"2017-06-1{d}",
            "locationName": "Locationville",
            "title": "Some volcano",
            "description": "...",
            "lat": 45.2,
            "lng": 22.321,
            "articles": [],
            "visualizationDates": {},
        }
        response = client.post("/v1/events", json=event, headers={"x-api-key": SECRET_API_KEY})
        assert response.status_code == 200
        assert response.json() == {"id": f"spa-12345{d}"}

    url = "/v1/events?confirmed=all"
    if date_from is not None:
        url += f"&date_from={date_from}"
    if date_to is not None:
        url += f"&date_to={date_to}"

    response = client.get(url)
    assert response.status_code == 200
    assert len(response.json()) == expected_len_events


def test_add_drought_event_with_effis_date(client):
    event = {
        "id": "eng-999999",
        "type": "drought",
        "date": "2019-06-12",
        "locationName": "Locationburg",
        "title": "No water",
        "description": "...",
        "lat": 42.0,
        "lng": 31.1415,
        "articles": [
            {
                "url": "https://nytimes.com/some-drought",
                "title": "Drought",
                "image": "https://nytimes.com/some-drought/image-01",
            }
        ],
        "visualizationDates": {
            "CRE_S3SLSTR": {"before": "2019-06-01", "after": "2019-06-10"},
            "EFFIS_VIIRS_FIRES": {"before": "2019-06-05", "after": "2019-06-05"},
        },
    }
    response = client.post("/v1/events", json=event, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    assert response.json() == {"id": "eng-999999"}

    response = client.get("/v1/events/eng-999999")
    assert response.status_code == 200
    retrieved_event = response.json()
    assert retrieved_event["type"] == "drought"


def test_add_air_pollution_event_with_product_specific_dates(client):
    visualizationDates = {
        "CRE_S5PL2": {
            "before": "2019-06-01",
            "after": "2019-06-10",
            "productSpecificDates": {
                "N02": {"before": "2019-06-03", "after": "2019-06-05"},
                "SO2": {"before": "2019-06-01", "after": "2019-06-10"},
            },
        },
    }
    overrideVisualizationDates = {
        "CRE_S5PL2": {
            "before": "2019-06-01",
            "after": "2019-06-10",
            "productSpecificDates": {
                "N02": {"before": "2019-06-02", "after": "2019-06-05"},
                "SO2": {"before": "2019-06-01", "after": "2019-06-11"},
            },
        },
        "AWS_S2L2A": {"before": "2019-06-02", "after": "2019-06-09"},
    }
    event = {
        "id": "eng-389203",
        "type": "air_pollution",
        "date": "2019-06-12",
        "locationName": "Poljutet Grad",
        "title": "Smog, ash and sand",
        "description": "...",
        "lat": 42.0,
        "lng": 31.1415,
        "articles": [
            {
                "url": "https://nytimes.com/awful-air",
                "title": "Drought",
                "image": "https://nytimes.com/awful-air/image-01",
            }
        ],
        "visualizationDates": visualizationDates,
        # "overrideVisualizationDates": overrideVisualizationDates
    }
    response = client.post("/v1/events", json=event, headers={"x-api-key": SECRET_API_KEY})
    assert response.status_code == 200
    assert response.json() == {"id": "eng-389203"}

    response = client.get("/v1/events/eng-389203")
    assert response.status_code == 200
    retrieved_event = response.json()
    assert retrieved_event["type"] == "air_pollution"

    assert retrieved_event["visualizationDates"] == visualizationDates

    response = client.patch(
        "/v1/events/eng-389203/override",
        json={"overrideVisualizationDates": overrideVisualizationDates},
        headers={"x-api-key": SECRET_API_KEY},
    )
    assert response.status_code == 200

    response = client.get("/v1/events/eng-389203")
    assert response.status_code == 200
    retrieved_event = response.json()

    assert retrieved_event["overrideVisualizationDates"] == overrideVisualizationDates
