import os
import datetime
from typing import Dict

from sqlalchemy import or_, and_
from sqlalchemy.orm import Session, joinedload, noload, subqueryload

import dbmodels
from dbmodels import Event, VisualizationDates, OverrideVisualizationDates
import objschemas


def migrate_db(db: Session):
    from alembic.command import upgrade
    from alembic.config import Config

    current_dir = os.path.dirname(os.path.realpath(__file__))
    config_file = os.path.join(current_dir, "alembic.ini")

    config = Config(file_=config_file)
    config.set_main_option("script_location", os.path.join(current_dir, "database"))
    upgrade(config, "head")


def create_event(db: Session, event: objschemas.EventCreate):
    event_dict = event.dict()
    del event_dict["articles"]
    visualizationDates = event_dict.get("visualizationDates", None)
    if "visualizationDates" in event_dict:
        del event_dict["visualizationDates"]

    db_event = Event(**event_dict)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    for article in event.articles:
        db_item = dbmodels.Article(**article.dict(), owner_id=db_event.id)
        db.add(db_item)
        db.commit()

    if visualizationDates is not None:
        _create_visualization_dates(db, db_event.id, visualizationDates)

    return {"id": db_event.id}


def patch_event(db: Session, event_id: str, event: objschemas.EventPatch):
    patch = event.dict(exclude_unset=True)
    visualizationDates = patch.get("visualizationDates", None)
    if "visualizationDates" in patch:
        del patch["visualizationDates"]

    articles = patch.get("articles", None)
    if articles is not None:
        del patch["articles"]

    if patch:
        db.query(Event).filter(Event.id == event_id).update(patch)
        db.commit()

    if visualizationDates is not None:
        _create_visualization_dates(db, event_id, visualizationDates, remove_existing=True)

    if articles:
        db.query(dbmodels.Article).filter_by(owner_id=event_id).delete()
        db.commit()

        for article in articles:
            db_item = dbmodels.Article(**article, owner_id=event_id)
            db.add(db_item)
            db.commit()


def _create_visualization_dates(db: Session, event_id: str, visualizationDates: Dict, remove_existing: bool = False):
    if remove_existing:
        db.query(dbmodels.VisualizationDates).filter_by(owner_id=event_id).delete()
        db.commit()
    # note that we get visualizationDates in the form of a dict where `datasetId`s are the keys:
    for datasetId, dates in visualizationDates.items():
        db_item = dbmodels.VisualizationDates(
            datasetId=str(datasetId), before=dates["before"], after=dates["after"], owner_id=event_id
        )
        db.add(db_item)
        db.commit()

        for product, product_dates in dates.get("productSpecificDates", {}).items():
            product_specific_dates_item = dbmodels.ProductSpecificDates(
                product=product, **product_dates, owner_id=db_item.id
            )
            db.add(product_specific_dates_item)
            db.commit()


def patch_event_override(db: Session, event_id: str, event_patch: objschemas.EventOverridePatch, admin: dbmodels.Admin):
    patch = event_patch.dict(exclude_unset=True)

    # before doing anything, write an audit trail:
    admin_id = None if admin is True else admin.id
    explanation = None
    if "explanation" in patch:
        explanation = patch["explanation"]
        del patch["explanation"]
    db_item = dbmodels.AuditTrail(event_id=event_id, admin_id=admin_id, explanation=explanation)
    db.add(db_item)
    db.commit()

    overrideVisualizationDates = patch.get("overrideVisualizationDates", None)
    if "overrideVisualizationDates" in patch:
        del patch["overrideVisualizationDates"]

    if patch:
        db.query(Event).filter(Event.id == event_id).update(patch)
        db.commit()

    if overrideVisualizationDates is not None:
        _create_override_visualization_dates(db, event_id, overrideVisualizationDates, remove_existing=True)


def _create_override_visualization_dates(
    db: Session, event_id: str, overrideVisualizationDates: Dict, remove_existing: bool = False
):
    if remove_existing:
        db.query(dbmodels.OverrideVisualizationDates).filter_by(owner_id=event_id).delete()
        db.commit()
    # note that we get visualizationDates in the form of a dict where `datasetId`s are the keys:
    for datasetId, dates in overrideVisualizationDates.items():
        db_item = dbmodels.OverrideVisualizationDates(
            datasetId=str(datasetId), before=dates["before"], after=dates["after"], owner_id=event_id
        )
        db.add(db_item)
        db.commit()

        for product, product_dates in dates.get("productSpecificDates", {}).items():
            product_specific_dates_item = dbmodels.OverrideProductSpecificDates(
                product=product, **product_dates, owner_id=db_item.id
            )
            db.add(product_specific_dates_item)
            db.commit()


def get_events(
    db: Session,
    confirmed: objschemas.ConfirmedQueryParam,
    date_from: datetime.date,
    date_to: datetime.date,
    offset: int,
    count: int,
):
    query = (
        db.query(Event)
        # for performance reasons, we do not load articles, visualizationDates and overrideVisualizationDates here:
        .options(noload(Event.articles))
        .options(noload(Event.visualizationDates))
        .options(noload(Event.overrideVisualizationDates))
        .order_by(Event.date.desc(), Event.id.desc())
    )

    if confirmed == objschemas.ConfirmedQueryParam.TRUE_OVERRIDEN:
        query = query.filter(
            or_(Event.overrideConfirmed == True, and_(Event.overrideConfirmed == None, Event.confirmed == True))
        )
    elif confirmed == objschemas.ConfirmedQueryParam.OVERRIDE_TRUE:
        query = query.filter_by(overrideConfirmed=True).order_by(Event.date.desc(), Event.id.desc())
    elif confirmed == objschemas.ConfirmedQueryParam.OVERRIDE_NULL:
        query = query.filter_by(overrideConfirmed=None).order_by(
            Event.confirmed.desc(), Event.date.desc(), Event.id.desc()
        )
    elif confirmed == objschemas.ConfirmedQueryParam.TRUE:
        query = query.filter_by(confirmed=True)
    elif confirmed == objschemas.ConfirmedQueryParam.FALSE:
        query = query.filter_by(confirmed=False)
    elif confirmed == objschemas.ConfirmedQueryParam.NULL:
        query = query.filter_by(confirmed=None)

    if date_from is not None:
        query = query.filter(Event.date >= date_from)
    if date_to is not None:
        query = query.filter(Event.date <= date_to)

    return query.offset(offset).limit(count).all()


def get_event(db: Session, event_id: str, include_audit_trail: bool):
    query = (
        db.query(Event)
        .options(joinedload(Event.articles))
        .options(joinedload(Event.visualizationDates).subqueryload(VisualizationDates.productSpecificDates))
        .options(
            joinedload(Event.overrideVisualizationDates).subqueryload(OverrideVisualizationDates.productSpecificDates)
        )
    )
    if include_audit_trail:
        query = query.options(joinedload(Event.auditTrail))
    else:
        query = query.options(noload(Event.auditTrail))
    return query.filter_by(id=event_id).first()


def remove_event(db: Session, event_id: str):
    num_rows_deleted = db.query(Event).filter_by(id=event_id).delete()
    db.commit()
    return num_rows_deleted


def create_admin(db: Session, admin: objschemas.AdminCreate):
    admin_dict = admin.dict()
    db_admin = dbmodels.Admin(**admin_dict)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return {"id": db_admin.id}


def patch_admin(db: Session, admin_id: str, admin: objschemas.AdminPatch):
    patch = admin.dict(exclude_unset=True)
    db.query(dbmodels.Admin).filter(dbmodels.Admin.id == admin_id).update(patch)
    db.commit()


def get_admin_by_api_key(db: Session, api_key: str, include_deleted: bool):
    query = db.query(dbmodels.Admin).filter_by(key=api_key)
    if not include_deleted:
        query = query.filter_by(enabled=True)
    return query.first()


def get_admins(db: Session, include_deleted: bool):
    query = db.query(dbmodels.Admin)
    if not include_deleted:
        query = query.filter_by(enabled=True)
    return query.order_by(dbmodels.Admin.username.asc()).all()


def remove_admin(db: Session, admin_id: str):
    # soft-delete, so we don't break the audit logs:
    admin = db.query(dbmodels.Admin).filter_by(id=admin_id, enabled=True).first()
    if not admin:
        return 0

    patch = {"enabled": False}
    db.query(dbmodels.Admin).filter(dbmodels.Admin.id == admin_id).update(patch)
    db.commit()
    return 1
