import { EVENT_TYPE } from '../const';

export const LEGEND_INFO = [
  {
    match: [{ layerId: 'CH4', eventType: EVENT_TYPE.AIR_POLLUTION }],
    legend: {
      type: 'continuous',
      minPosition: 1600,
      maxPosition: 2000,
      gradients: [
        { position: 1600, color: '#000080', label: '1600' },
        { position: 1650, color: '#0000ff', label: '1650' },
        { position: 1750, color: '#00ffff', label: '1750' },
        { position: 1850, color: '#ffff00', label: '1850' },
        { position: 1950, color: '#ff0000', label: '1950' },
        { position: 2000, color: '#800000', label: '2000 [ppb]' },
      ],
    },
  },

  {
    match: [{ eventType: EVENT_TYPE.AIR_POLLUTION, layerId: 'HCHO' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.001,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.000125, color: '#0000ff', label: '125' },
        { position: 0.000375, color: '#00ffff', label: '375' },
        { position: 0.000625, color: '#ffff00', label: '625' },
        { position: 0.000875, color: '#ff0000', label: '875' },
        { position: 0.001, color: '#800000', label: '1000 [μmol / m²]' },
      ],
    },
  },

  {
    match: [{ eventType: EVENT_TYPE.AIR_POLLUTION, layerId: 'SO2' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.01,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.00125, color: '#0000ff', label: '1250' },
        { position: 0.00375, color: '#00ffff', label: '3750' },
        { position: 0.00625, color: '#ffff00', label: '6250' },
        { position: 0.00875, color: '#ff0000', label: '8750' },
        { position: 0.01, color: '#800000', label: '10000 [μmol / m²]' },
      ],
    },
  },

  {
    match: [{ eventType: EVENT_TYPE.AIR_POLLUTION, layerId: 'O3' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.36,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.045, color: '#0000ff', label: '0.045' },
        { position: 0.135, color: '#00ffff', label: '0.135' },
        { position: 0.225, color: '#ffff00', label: '0.225' },
        { position: 0.315, color: '#ff0000', label: '0.315' },
        { position: 0.36, color: '#800000', label: '0.36 [mol / m²]' },
      ],
    },
  },

  {
    match: [{ eventType: EVENT_TYPE.AIR_POLLUTION, layerId: 'NO2' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.0001,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.0000125, color: '#0000ff', label: '12.5' },
        { position: 0.0000375, color: '#00ffff', label: '37.5' },
        { position: 0.0000625, color: '#ffff00', label: '62.5' },
        { position: 0.0000875, color: '#ff0000', label: '87.5' },
        { position: 0.0001, color: '#800000', label: '100 [μmol / m²]' },
      ],
    },
  },

  {
    match: [{ eventType: EVENT_TYPE.AIR_POLLUTION, layerId: 'CO' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.1,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.0125, color: '#0000ff', label: '0.0125' },
        { position: 0.0375, color: '#00ffff', label: '0.0375' },
        { position: 0.0625, color: '#ffff00', label: '0.0625' },
        { position: 0.0875, color: '#ff0000', label: '0.0875' },
        { position: 0.1, color: '#800000', label: '0.1 [mol / m²]' },
      ],
    },
  },

  {
    match: [
      { eventType: EVENT_TYPE.AIR_POLLUTION, layerId: 'AER_AI_340_380' },
      { eventType: EVENT_TYPE.AIR_POLLUTION, layerId: 'AER_AI_354_388' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -1.0,
      maxPosition: 5.0,
      gradients: [
        { position: -1.0, color: '#000080', label: '-1.0' },
        { position: -0.25, color: '#0000ff', label: '-0.25' },
        { position: 1.25, color: '#00ffff', label: '1.25' },
        { position: 2.75, color: '#ffff00', label: '2.75' },
        { position: 4.25, color: '#ff0000', label: '4.25' },
        { position: 5, color: '#800000', label: '5' },
      ],
    },
  },

  {
    match: [{ eventType: EVENT_TYPE.AIR_POLLUTION, layerId: 'NO2-VISUALISATION' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 180,
      gradients: [
        { position: 0, color: '#FFFFFF', label: '0' },
        { position: 45, color: '#FDCFBC', label: '45' },
        { position: 90, color: '#FC8767', label: '90' },
        { position: 135, color: '#D72422', label: '135' },
        { position: 180, color: '#67000D', label: '180+ [μmol / m²]' },
      ],
    },
  },
];
