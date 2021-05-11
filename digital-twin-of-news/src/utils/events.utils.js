import moment from 'moment';

import { SUPPORTED_EVENT_TYPES } from '../const';

export function convertEventsFormat(event) {
  const {
    overrideLat,
    overrideLng,
    overrideZoom,
    overrideConfirmed,
    overrideVisualizationDates = {},
  } = event;
  event.date = moment.utc(event.date);
  event.originalLat = event.lat;
  event.originalLng = event.lng;
  event.originalZoom = event.zoom;
  event.originalConfirmed = event.confirmed;
  event.originalVisualizationDates = event.visualizationDates;
  if (overrideLat !== null) {
    event.lat = overrideLat;
  }
  if (overrideLng !== null) {
    event.lng = overrideLng;
  }
  if (overrideZoom !== null) {
    event.zoom = overrideZoom;
  }
  if (overrideConfirmed !== null) {
    event.confirmed = overrideConfirmed;
  }
  if (Object.keys(overrideVisualizationDates).length > 0) {
    // Construct visualization dates for all available datasets, giving preference to overrideVisualizationDates
    const datasetIds = new Set([
      ...Object.keys(event.visualizationDates),
      ...Object.keys(event.overrideVisualizationDates),
    ]);
    const visualizationDates = {};
    for (let datasetId of datasetIds) {
      if (event.overrideVisualizationDates[datasetId]) {
        visualizationDates[datasetId] = event.overrideVisualizationDates[datasetId];
      } else {
        visualizationDates[datasetId] = event.visualizationDates[datasetId];
      }
    }
    event.visualizationDates = visualizationDates;
  }
  return event;
}

export function getAppropriateClassName(confirmed, overrideConfirmed) {
  if (overrideConfirmed === false) {
    return 'confirmed-bad';
  } else if (overrideConfirmed === null) {
    if (confirmed === null) {
      return 'not-confirmed';
    } else if (confirmed === false) {
      return 'probably-bad';
    }
    return 'probably-good';
  }
  return 'confirmed-good';
}

export function filterSupportedEventTypes(events) {
  return events.filter((event) => SUPPORTED_EVENT_TYPES.includes(event['type']));
}

export function getAppropriateVisualizationDates(visualizationDates, datasetId, layerId) {
  if (visualizationDates[datasetId]) {
    if (
      visualizationDates[datasetId].productSpecificDates &&
      layerId in visualizationDates[datasetId].productSpecificDates
    ) {
      return visualizationDates[datasetId].productSpecificDates[layerId];
    }
    const { before, after } = visualizationDates[datasetId];
    return { before: before, after: after };
  }
  return null;
}
