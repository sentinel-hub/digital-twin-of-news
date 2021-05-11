import datetime
import logging
import os
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader, APIKey
from mangum import Mangum
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import database
from objschemas import (
    EventCreate,
    EventPatch,
    EventOverridePatch,
    Event,
    EventWithAuditTrail,
    RecordCreateResponse,
    ConfirmedQueryParam,
    EventWithinList,
    Admin,
    AdminCreate,
    AdminPatch,
)
from crud import (
    create_event,
    get_events,
    get_event,
    patch_event,
    patch_event_override,
    remove_event,
    migrate_db,
    create_admin,
    get_admin_by_api_key,
    get_admins,
    remove_admin,
    patch_admin,
)


SECRET_API_KEY = os.environ.get("SECRET_API_KEY", None)
if not SECRET_API_KEY:
    raise Exception("Please define SECRET_API_KEY env var.")


# https://medium.com/data-rebels/fastapi-authentication-revisited-enabling-api-key-authentication-122dc5975680
API_KEY_HEADER_NAME = "x-api-key"
api_key_header = APIKeyHeader(name=API_KEY_HEADER_NAME, auto_error=False)


app = FastAPI(
    # workaround so that /docs endpoint works:
    #   https://github.com/iwpnd/fastapi-aws-lambda-example/issues/2
    openapi_prefix=os.environ.get("URL_PREFIX", "/"),
    title="Digital Twin of the News API",
    description='Backend API for <a href="https://apps.sentinel-hub.com/digital-twin-news/">Digital Twin of the News</a>',
    version=os.environ.get("DTON_API_VERSION", "v0.0.0"),
)
handler = Mangum(app, enable_lifespan="off")


CORS_ORIGINS = [
    "https://apps.sentinel-hub.com",
    "https://webdev.sentinel-hub.com",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependencies


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def validate_superadmin(api_key_header: str = Security(api_key_header)):
    if api_key_header == SECRET_API_KEY:
        return True
    else:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


def get_optional_admin(api_key_header: str = Security(api_key_header), db: Session = Depends(get_db)):
    if api_key_header == SECRET_API_KEY:
        return True  # superadmin
    admin = get_admin_by_api_key(db, api_key_header, include_deleted=False)
    if not admin:
        return None
    return admin


def get_valid_admin(api_key_header: str = Security(api_key_header), db: Session = Depends(get_db)):
    if api_key_header == SECRET_API_KEY:
        return True  # superadmin
    admin = get_admin_by_api_key(db, api_key_header, include_deleted=False)
    if not admin:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return admin


# /Dependencies


@app.post(
    "/v1/events",
    response_model=RecordCreateResponse,
    summary="Create a new event",
    tags=["Events"],
)
async def app_post_event(
    event: EventCreate, db: Session = Depends(get_db), is_superadmin: bool = Depends(validate_superadmin)
):
    try:
        return create_event(db, event)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Event already exists")


@app.get(
    "/v1/events",
    response_model=List[EventWithinList],
    summary="Get a list of recent events",
    tags=["Events"],
)
async def app_get_events(
    confirmed: Optional[ConfirmedQueryParam] = ConfirmedQueryParam.OVERRIDE_TRUE,
    date_from: Optional[datetime.date] = None,
    date_to: Optional[datetime.date] = None,
    offset: Optional[int] = 0,
    count: Optional[int] = 50,
    db: Session = Depends(get_db),
):
    """
    Returns a list of events sorted by date descending (and descending ID if dates are equal).

    Parameter 'confirmed' configures which events are returned:
    - `all`: all the events are returned
    - `override_true`: returns the events which have `overrideConfirmed` set to `true` (default - returns only manually checked and confirmed events)
    - `override_null`: returns the events which have `overrideConfirmed` set to `null`
    - `true_overriden`: returns the events which have either `overrideConfirmed` set to `true`, or `overrideConfirmed` is set to `null` (not overriden) and `confirmed` is `true`
    - `true`: returns the events which have `confirmed` set to `true`
    - `false`: returns the events which have `confirmed` set to `false`
    - `null`: returns the events which have `confirmed` set to `null`
    """
    return get_events(db, confirmed, date_from, date_to, offset, count)


@app.get(
    "/v1/events/{event_id}",
    summary="Get event details",
    tags=["Events"],
)
async def app_get_event(event_id: str, db: Session = Depends(get_db), admin=Depends(get_optional_admin)):
    include_audit_trail = admin is not None
    dbevent = get_event(db, event_id, include_audit_trail)

    if not dbevent:
        raise HTTPException(status_code=404, detail="Event does not exist")

    # to avoid having an auditTrail field in response if user is not authenticated, we return two different types:
    if include_audit_trail:
        result = EventWithAuditTrail.from_orm(dbevent)
        return result
    else:
        return Event.from_orm(dbevent)


@app.patch(
    "/v1/events/{event_id}",
    summary="Update an existing event",
    tags=["Events"],
)
async def app_patch_event(
    event_id: str, event: EventPatch, db: Session = Depends(get_db), is_superadmin: bool = Depends(validate_superadmin)
):
    return patch_event(db, event_id, event)


@app.patch(
    "/v1/events/{event_id}/override",
    summary="Update an existing event with manual overrides",
    tags=["Events"],
)
async def app_patch_override_event(
    event_id: str, event: EventOverridePatch, db: Session = Depends(get_db), admin: Admin = Depends(get_valid_admin)
):
    return patch_event_override(db, event_id, event, admin)


@app.delete(
    "/v1/events/{event_id}",
    summary="Remove event",
    tags=["Events"],
)
async def app_remove_event(
    event_id: str, db: Session = Depends(get_db), is_superadmin: bool = Depends(validate_superadmin)
):
    if not remove_event(db, event_id):
        raise HTTPException(404, "Event does not exist")


@app.post(
    "/migratedb",
    summary="Perform database schema migration (if needed)",
    tags=["Operations"],
)
def post_migratedb(db: Session = Depends(get_db)):
    try:
        migrate_db(db)
        return {"status": "ok"}
    except:
        logging.exception("DB migration failed")
        raise HTTPException(status_code=500, detail="DB migration failed")


@app.get(
    "/v1/admins",
    response_model=List[Admin],
    summary="Get a list of admin users",
    tags=["Admins"],
)
async def app_get_admins(db: Session = Depends(get_db), is_superadmin: bool = Depends(validate_superadmin)):
    """Returns a list of system administrators."""
    return get_admins(db, include_deleted=True)


@app.post(
    "/v1/admins",
    response_model=RecordCreateResponse,
    summary="Insert an admin user",
    tags=["Admins"],
)
async def app_post_admin(
    admin: AdminCreate, db: Session = Depends(get_db), is_superadmin: bool = Depends(validate_superadmin)
):
    try:
        return create_admin(db, admin)
    except IntegrityError as ex:
        raise HTTPException(status_code=409, detail="Admin already exists")


@app.patch(
    "/v1/admins/{admin_id}",
    summary="Update an existing admin",
    tags=["Admins"],
)
async def app_patch_event(
    admin_id: str, admin: AdminPatch, db: Session = Depends(get_db), is_superadmin: bool = Depends(validate_superadmin)
):
    return patch_admin(db, admin_id, admin)


@app.delete(
    "/v1/admins/{admin_id}",
    summary="Remove admin",
    tags=["Admins"],
)
async def app_remove_admin(
    admin_id: str, db: Session = Depends(get_db), is_superadmin: bool = Depends(validate_superadmin)
):
    if not remove_admin(db, admin_id):
        raise HTTPException(404, "Admin does not exist")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app)
