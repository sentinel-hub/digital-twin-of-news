import {
  DATASET_S3SLSTR,
  DATASET_S2L2A,
  DATASET_S2L1C,
  DATASET_AWSEU_S1GRD,
  DATASET_S5PL2,
} from '@sentinel-hub/sentinelhub-js';

import about from './documentation/about.md';
import wildfires from './documentation/wildfires.md';
import volcanoes from './documentation/volcanoes.md';
import floods from './documentation/floods.md';
import droughts from './documentation/droughts.md';
import air_pollution from './documentation/air_pollution.md';

import styleVars from './variables.scss';

export const EVENT_TYPE = {
  WILDFIRE: 'wildfire',
  ICEBERG: 'iceberg',
  FLOOD: 'flood',
  VOLCANO: 'volcano',
  DROUGHT: 'drought',
  AIR_POLLUTION: 'air_pollution',
};

export const MIN_DATE = '2017-01-01';

export const EOB_THEMES_FOR_TYPE = {
  [EVENT_TYPE.WILDFIRE]: {
    [DATASET_S3SLSTR.id]: 'WILDFIRES-NORMAL-MODE',
    [DATASET_S2L2A.id]: 'WILDFIRES-NORMAL-MODE',
    [DATASET_S2L1C.id]: 'WILDFIRES-NORMAL-MODE',
  },
  [EVENT_TYPE.VOLCANO]: {
    [DATASET_S3SLSTR.id]: 'DEFAULT-THEME',
    [DATASET_S2L2A.id]: 'VOLCANOES-NORMAL-MODE',
    [DATASET_S2L1C.id]: 'VOLCANOES-NORMAL-MODE',
  },
  [EVENT_TYPE.FLOOD]: {
    [DATASET_AWSEU_S1GRD.id]: 'DEFAULT-THEME',
    [DATASET_S2L2A.id]: 'FLOODING-NORMAL-MODE',
    [DATASET_S2L1C.id]: 'FLOODING-NORMAL-MODE',
  },
  [EVENT_TYPE.DROUGHT]: {
    [DATASET_S2L2A.id]: 'FLOODING-NORMAL-MODE',
    [DATASET_S2L1C.id]: 'FLOODING-NORMAL-MODE',
  },
  [EVENT_TYPE.AIR_POLLUTION]: {
    [DATASET_S5PL2.id]: 'ATMOSPHERE-NORMAL-MODE',
    [DATASET_S5PL2.id]: 'ATMOSPHERE-NORMAL-MODE',
  },
};

const S5_LAYER_TO_EOB_ID = (layerId) => {
  switch (layerId) {
    case 'O3':
      return 'S5_O3';
    case 'NO2':
      return 'S5_NO2';
    case 'SO2':
      return 'S5_SO2';
    case 'CO':
      return 'S5_CO';
    case 'HCHO':
      return 'S5_HCHO';
    case 'CH4':
      return 'S5_CH4';
    case 'AER_AI_340_380':
    case 'AER_AI_354_388':
      return 'S5_AER_AI';
    default:
      return 'S5_OTHER';
  }
};

export const SH_TO_EOB_ID = (datasetId, layerId) => {
  switch (datasetId) {
    case DATASET_S3SLSTR.id:
      return 'S3SLSTR';
    case DATASET_S2L2A.id:
      return 'S2L2A';
    case DATASET_S2L1C.id:
      return 'S2L1C';
    case DATASET_AWSEU_S1GRD.id:
      return 'S1_AWS_IW_VVVH';
    case DATASET_S5PL2.id:
      return S5_LAYER_TO_EOB_ID(layerId);
    default:
      return null;
  }
};

export const SUPPORTED_EVENT_TYPES = [
  EVENT_TYPE.WILDFIRE,
  EVENT_TYPE.VOLCANO,
  EVENT_TYPE.FLOOD,
  EVENT_TYPE.DROUGHT,
  EVENT_TYPE.AIR_POLLUTION,
];

export const EVENT_TYPE_PROPERTIES = {
  [EVENT_TYPE.WILDFIRE]: {
    name: 'Wildfires',
    color: styleVars.wildfireColor,
  },
  [EVENT_TYPE.VOLCANO]: {
    name: 'Volcanoes',
    color: styleVars.volcanoColor,
  },
  [EVENT_TYPE.FLOOD]: {
    name: 'Floods',
    color: styleVars.floodColor,
  },
  [EVENT_TYPE.DROUGHT]: {
    name: 'Droughts',
    color: styleVars.droughtColor,
  },
  [EVENT_TYPE.AIR_POLLUTION]: {
    name: 'Air Pollution',
    color: styleVars.airPollutionColor,
  },
};

export const EFFIS_VIIRS_FIRES = {
  id: 'EFFIS_VIIRS_FIRES',
  baseUrl: 'https://maps.wild-fire.eu/gwis',
  layerId: 'viirs.hs',
  title: 'VIIRS Active Fires',
};

export const LAYERS_PNG_ONLY = {
  [DATASET_S3SLSTR.id]: ['HIGH-TEMPERATURE-DETECTION'],
  [EFFIS_VIIRS_FIRES.id]: [EFFIS_VIIRS_FIRES.layerId],
  [DATASET_S5PL2.id]: ['CO', 'HCHO', 'NO2', 'O3', 'SO2', 'CH4', 'AER_AI_340_380', 'AER_AI_354_388'],
};

export const only_show_layers_with_specific_dates = (event_type) => event_type === EVENT_TYPE.AIR_POLLUTION;

export const DOCUMENTATION = [
  {
    title: 'About',
    text: about,
  },
  {
    title: 'Wildfires',
    text: wildfires,
  },
  {
    title: 'Volcanoes',
    text: volcanoes,
  },
  {
    title: 'Floods',
    text: floods,
  },
  {
    title: 'Droughts',
    text: droughts,
  },
  {
    title: 'Air Pollution',
    text: air_pollution,
  },
];

export const SWIPE_POPUP_STATUSES = {
  open: 'open',
  closed: 'closed',
  init: 'init',
};
