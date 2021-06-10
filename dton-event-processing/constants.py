from enum import Enum


class EventType(str, Enum):
    WILDFIRE = "wildfire"
    VOLCANO = "volcano"
    FLOOD = "flood"
    DROUGHT = "drought"
    AIR_POLLUTION = "air_pollution"

    @staticmethod
    def from_str(value):
        if value == EventType.VOLCANO:
            return EventType.VOLCANO
        if value == EventType.WILDFIRE:
            return EventType.WILDFIRE
        if value == EventType.FLOOD:
            return EventType.FLOOD
        if value == EventType.DROUGHT:
            return EventType.DROUGHT
        if value == EventType.AIR_POLLUTION:
            return EventType.AIR_POLLUTION
        return None
