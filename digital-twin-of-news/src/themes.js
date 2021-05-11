import { EVENT_TYPE } from './const';

export const THEMES = {
  [EVENT_TYPE.WILDFIRE]: {
    instanceId: process.env.REACT_APP_WILDFIRE_INSTANCE_ID,
  },
  [EVENT_TYPE.VOLCANO]: {
    instanceId: process.env.REACT_APP_VOLCANO_INSTANCE_ID,
  },
  [EVENT_TYPE.FLOOD]: {
    instanceId: process.env.REACT_APP_FLOOD_INSTANCE_ID,
  },
  [EVENT_TYPE.DROUGHT]: {
    instanceId: process.env.REACT_APP_DROUGHT_INSTANCE_ID,
  },
  [EVENT_TYPE.AIR_POLLUTION]: {
    instanceId: process.env.REACT_APP_AIR_POLLUTION_INSTANCE_ID,
  },
};
