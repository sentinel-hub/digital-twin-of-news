import datetime
import uuid
from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    JSON,
    func,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from database.database import Base
from objschemas import EventType


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    created = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    type = Column(Enum(EventType), nullable=False)
    date = Column(Date, nullable=False)
    locationName = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    zoom = Column(Integer, nullable=False, default=13)
    confirmed = Column(Boolean, nullable=True, default=None)

    articles = relationship("Article", back_populates="owner", passive_deletes=True)
    visualizationDates = relationship("VisualizationDates", back_populates="owner", passive_deletes=True)

    # these columns allow manual overriding of some aspects of the event:
    overrideLat = Column(Float, nullable=True, default=None)
    overrideLng = Column(Float, nullable=True, default=None)
    overrideZoom = Column(Integer, nullable=True, default=None)
    overrideConfirmed = Column(Boolean, nullable=True, default=None)
    overrideVisualizationDates = relationship(
        "OverrideVisualizationDates", back_populates="owner", passive_deletes=True
    )

    auditTrail = relationship(
        "AuditTrail", back_populates="event", passive_deletes=True, order_by="asc(AuditTrail.created)"
    )


class AuditTrail(Base):
    __tablename__ = "audit_trail"

    id = Column(Integer, primary_key=True, index=True)
    created = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"))
    admin_id = Column(Integer, ForeignKey("admins.id", ondelete="RESTRICT"))
    explanation = Column(String, nullable=True)

    event = relationship("Event", back_populates="auditTrail")
    admin = relationship("Admin", back_populates="auditTrail")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"))

    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    source = Column(String, nullable=True)
    image = Column(String, nullable=True)

    owner = relationship("Event", back_populates="articles")


class ProductSpecificDates(Base):
    __tablename__ = "product_specific_dates"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("visualization_dates.id", ondelete="CASCADE"))

    product = Column(String, nullable=False)
    before = Column(Date, nullable=False)
    after = Column(Date, nullable=False)

    owner = relationship("VisualizationDates", back_populates="productSpecificDates")


class VisualizationDates(Base):
    __tablename__ = "visualization_dates"
    __table_args__ = (UniqueConstraint("owner_id", "datasetId"),)

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"))

    datasetId = Column(String, nullable=False)
    before = Column(Date, nullable=False)
    after = Column(Date, nullable=False)

    productSpecificDates = relationship("ProductSpecificDates", back_populates="owner")

    owner = relationship("Event", back_populates="visualizationDates")


class OverrideProductSpecificDates(Base):
    __tablename__ = "override_product_specific_dates"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("override_visualization_dates.id", ondelete="CASCADE"))

    product = Column(String, nullable=False)
    before = Column(Date, nullable=False)
    after = Column(Date, nullable=False)

    owner = relationship("OverrideVisualizationDates", back_populates="productSpecificDates")


class OverrideVisualizationDates(Base):
    __tablename__ = "override_visualization_dates"
    __table_args__ = (UniqueConstraint("owner_id", "datasetId"),)

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"))

    datasetId = Column(String, nullable=False)
    before = Column(Date, nullable=False)
    after = Column(Date, nullable=False)

    productSpecificDates = relationship("OverrideProductSpecificDates", back_populates="owner")

    owner = relationship("Event", back_populates="overrideVisualizationDates")


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    created = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    username = Column(String, nullable=False, unique=True, index=True)
    key = Column(String, nullable=False, unique=True, index=True)
    enabled = Column(Boolean, nullable=False, default=True)

    auditTrail = relationship("AuditTrail", back_populates="admin", passive_deletes=True)
