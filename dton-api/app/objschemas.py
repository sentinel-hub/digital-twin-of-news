import datetime
from enum import Enum
from typing import Optional, List, Dict

from pydantic import BaseModel


class AdminBase(BaseModel):
    username: str
    key: str


class AdminCreate(AdminBase):
    pass


class AdminPatch(BaseModel):
    key: Optional[str]

    class Config:
        extra = "forbid"


class Admin(AdminBase):
    id: str
    created: datetime.datetime
    enabled: bool

    class Config:
        orm_mode = True
        extra = "forbid"


class AdminGetUsername(BaseModel):
    username: str

    class Config:
        orm_mode = True


class AuditTrail(BaseModel):
    id: int
    created: datetime.datetime
    explanation: Optional[str]
    admin: Optional[AdminGetUsername]

    class Config:
        orm_mode = True
        extra = "forbid"


class EventType(Enum):
    WILDFIRE = "wildfire"
    FLOOD = "flood"
    VOLCANO = "volcano"
    DROUGHT = "drought"
    AIR_POLLUTION = "air_pollution"


# any dataset ID used should also appear here:
# https://github.com/sentinel-hub/sentinelhub-js/blob/master/src/layer/dataset.ts
class DatasetId(Enum):
    AWSEU_S1GRD = "AWSEU_S1GRD"
    EOC_S1GRD_IW = "EOC_S1GRD_IW"
    AWS_S2L2A = "AWS_S2L2A"
    AWS_S2L1C = "AWS_S2L1C"
    CRE_S3SLSTR = "CRE_S3SLSTR"
    CRE_S3OLCI = "CRE_S3OLCI"
    CRE_S5PL2 = "CRE_S5PL2"
    AWS_L8L1C = "AWS_L8L1C"
    EOC_L5 = "EOC_L5"
    EOC_L7 = "EOC_L7"
    EOC_L8 = "EOC_L8"
    EOC_ENVISAT_MERIS = "EOC_ENVISAT_MERIS"
    AWS_MODIS = "AWS_MODIS"
    EFFIS_VIIRS_FIRES = "EFFIS_VIIRS_FIRES"

    def __str__(self):
        return str(self.value)


class Article(BaseModel):
    url: str
    title: str
    source: Optional[str]
    image: Optional[str]

    class Config:
        orm_mode = True
        extra = "forbid"


class VisualizationDatesBase(BaseModel):
    before: datetime.date
    after: datetime.date

    class Config:
        extra = "forbid"


class VisualizationDates(VisualizationDatesBase):
    productSpecificDates: Optional[Dict[str, VisualizationDatesBase]] = {}


class EventBase(BaseModel):
    id: str
    type: EventType
    date: datetime.date
    locationName: str
    title: str
    description: str
    lat: float
    lng: float
    zoom: Optional[int]
    confirmed: Optional[bool]


class EventBaseRelated(BaseModel):
    articles: List[Article]
    visualizationDates: Optional[Dict[DatasetId, VisualizationDates]] = {}


class EventBaseOverride(BaseModel):
    overrideLat: Optional[float]
    overrideLng: Optional[float]
    overrideZoom: Optional[int]
    overrideConfirmed: Optional[bool]


class EventBaseOverrideWithRelated(EventBaseOverride):
    overrideVisualizationDates: Optional[Dict[DatasetId, VisualizationDates]]


class EventCreate(EventBase, EventBaseRelated):
    pass


class EventPatch(BaseModel):
    lat: Optional[float]
    lng: Optional[float]
    zoom: Optional[int]
    confirmed: Optional[bool]
    visualizationDates: Optional[Dict[DatasetId, VisualizationDates]]
    articles: Optional[List[Article]]

    class Config:
        extra = "forbid"


class EventOverridePatch(EventBaseOverrideWithRelated):
    explanation: Optional[str]

    class Config:
        extra = "forbid"


class Event(EventBase, EventBaseRelated, EventBaseOverrideWithRelated):
    created: datetime.datetime

    class Config:
        orm_mode = True
        extra = "forbid"

    # SQLAlchemy wants to get `visualizationDates` as list, while we would like to use a dict in Pydantic. This
    # method converts the record which was fetched from DB so that it matches our definition of Event:
    @classmethod
    def from_orm(cls, obj):
        def generate_product_specific_dates(productSpecificDates):
            if len(productSpecificDates) == 0:
                return {}
            return {
                "productSpecificDates": {
                    p.product: {"before": p.before, "after": p.after} for p in productSpecificDates
                }
            }

        # convert list to dict:
        visualizationDates = {
            x.datasetId: {
                "before": x.before,
                "after": x.after,
                **generate_product_specific_dates(x.productSpecificDates),
            }
            for x in obj.visualizationDates
        }
        overrideVisualizationDates = {
            x.datasetId: {
                "before": x.before,
                "after": x.after,
                **generate_product_specific_dates(x.productSpecificDates),
            }
            for x in obj.overrideVisualizationDates
        }
        # temporarily set to empty list, so that parent does not convert anything:
        obj.visualizationDates = []
        obj.overrideVisualizationDates = []
        result = super().from_orm(obj)
        result.visualizationDates = visualizationDates
        result.overrideVisualizationDates = overrideVisualizationDates
        return result


class EventWithAuditTrail(Event):
    auditTrail: List[AuditTrail]


class EventWithinList(EventBase, EventBaseOverride):
    created: datetime.datetime

    class Config:
        orm_mode = True
        extra = "forbid"


class RecordCreateResponse(BaseModel):
    id: str


class ConfirmedQueryParam(Enum):
    ALL = "all"
    TRUE_OVERRIDEN = "true_overriden"
    OVERRIDE_NULL = "override_null"
    OVERRIDE_TRUE = "override_true"
    TRUE = "true"
    FALSE = "false"
    NULL = "null"
