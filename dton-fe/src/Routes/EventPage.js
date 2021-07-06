import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import L from 'leaflet';
import { LayersFactory, BBox, CRS_EPSG4326, WmsLayer, DATASET_S5PL2 } from '@sentinel-hub/sentinelhub-js';
import moment from 'moment';

import { getPrevNextDate } from '../utils/sentinelhub.utils';
import { isEvalscriptMultitemporal } from '../utils/parseEvalscript';
import { getAppropriateVisualizationDates } from '../utils/events.utils';
import EventInfo from '../components/Event/EventInfo';
import Map from '../components/Map/Map';
import {
  LAYERS_PNG_ONLY,
  EFFIS_VIIRS_FIRES,
  only_show_layers_with_specific_dates,
  S5P_TROPOMI_NO2,
  EVENT_TYPE,
} from '../const';
import { THEMES } from '../themes';
import { getApiKeyFromLocalStorage } from '../auth/auth.utils';
import useWindowSize from '../utils/useWindowSize';

import styleVars from '../variables.scss';
import './EventPage.scss';

function EventPage(props) {
  const windowSize = useWindowSize();
  const history = useHistory();
  const { event, error, isFullscreenMap } = props;
  const [themeLayers, setThemeLayers] = useState([]);
  const [mapInstance, setMapInstance] = useState();
  const [visualizationParams, setVisualizationParams] = useState({});

  const mediumWidth = parseInt(styleVars.medium.replace('px', ''));

  useEffect(() => {
    if (event === undefined && !error) {
      history.push('/');
      return;
    }
    if (event && event.type) {
      const apiKey = getApiKeyFromLocalStorage();
      const isEventConfirmed = event.overrideConfirmed !== null ? event.overrideConfirmed : event.confirmed;
      let datasetsToDisplay;
      if (isEventConfirmed) {
        // If event is confirmed, only show layers for datasets which have visualization dates
        datasetsToDisplay = Object.keys(event.visualizationDates);
      }
      fetchLayers(apiKey, event.type, event.visualizationDates, datasetsToDisplay);
    }
    // eslint-disable-next-line
  }, [event, error, history]);

  const fetchLayers = async (apiKey, eventType, visualizationDates, datasetsToDisplay) => {
    const selectedTheme = THEMES[eventType];
    let layers = await LayersFactory.makeLayers(
      'https://services.sentinel-hub.com/ogc/wms/' + selectedTheme.instanceId,
      (_, dataset) => (datasetsToDisplay ? datasetsToDisplay.includes(dataset.id) : true),
      { maxCloudCoverPercent: 100 },
    );

    if (only_show_layers_with_specific_dates(eventType)) {
      // If a event has productSpecific dates and we are supposed to only show those layers, we filter out layers without dates specified there
      layers = layers.filter((l) =>
        visualizationDates[l.dataset.id] && visualizationDates[l.dataset.id].productSpecificDates
          ? l.layerId in visualizationDates[l.dataset.id].productSpecificDates
          : true,
      );
    }

    layers.push(...constructWMSLayers(visualizationDates, eventType));

    // we are a bit picky about layers' sort order - these known layers should be at the top:
    const PREFERRED_SORT_ORDER = [
      'NO2-VISUALISATION',
      '3_NDWI',
      'TRUE-COLOR-LAVA-FLOW',
      'WILDFIRES',
      '2_MOISTURE-INDEX',
      '5_NDVI',
      'TRUE-COLOR',
      '1_TRUE_COLOR',
      'viirs.hs',
      'HIGH-TEMPERATURE-DETECTION',
      'BURNED-AREAS-DETECTION',
    ];

    let sortedLayers = layers.sort((a, b) => {
      let aPos = PREFERRED_SORT_ORDER.indexOf(a.layerId);
      aPos = aPos === -1 ? PREFERRED_SORT_ORDER.length : aPos;
      let bPos = PREFERRED_SORT_ORDER.indexOf(b.layerId);
      bPos = bPos === -1 ? PREFERRED_SORT_ORDER.length : bPos;
      if (aPos < bPos) {
        return -1;
      }
      if (aPos > bPos) {
        return 1;
      }

      return a.layerId < b.layerId ? -1 : a.layerId > b.layerId ? 1 : 0;
    });

    if (!apiKey && eventType === 'volcano') {
      sortedLayers = sortedLayers.filter(({ layerId }) => layerId !== 'HIGH-TEMPERATURE-DETECTION');
    }
    setThemeLayers(sortedLayers);
    changeVisualizationLayer(sortedLayers[0].layerId);
  };

  function constructWMSLayers(visualizationDates, eventType) {
    function createWMSLayer(dataset) {
      const layer = new WmsLayer({
        baseUrl: dataset.baseUrl,
        layerId: dataset.layerId,
      });
      layer.dataset = { id: dataset.id };
      layer.title = dataset.title;
      return layer;
    }

    const wmsLayers = [];

    if (!!visualizationDates[EFFIS_VIIRS_FIRES.id]) {
      const effisLayer = createWMSLayer(EFFIS_VIIRS_FIRES);
      wmsLayers.push(effisLayer);
    }

    if (eventType === EVENT_TYPE.AIR_POLLUTION) {
      const mundisNO2Layer = createWMSLayer(S5P_TROPOMI_NO2);
      wmsLayers.push(mundisNO2Layer);
    }
    return wmsLayers;
  }

  function setMapPosition(position, zoom) {
    mapInstance.setView(position, zoom);
  }

  function getMapPosition() {
    const { lat, lng } = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    return { lat, lng, zoom };
  }

  async function getAndSetPrevNextDate(currentDate, position, direction) {
    if (isWMSLayer(selectedLayerId)) {
      const newVisDates = { ...visualizationDates };
      let newDate;
      if (direction === 'prev') {
        newDate = currentDate.clone().subtract(1, 'day');
      } else if (direction === 'next') {
        newDate = currentDate.clone().add(1, 'day');
      }
      const newTimerange = [newDate.clone().startOf('day'), newDate.clone().endOf('day')];

      if (position === 'left') {
        newVisDates.before = newTimerange;
      }
      if (position === 'right') {
        newVisDates.after = newTimerange;
      }
      setVisualizationParams((prevState) => ({
        ...prevState,
        visualizationDates: newVisDates,
      }));
    } else {
      const layer = await LayersFactory.makeLayer(
        `https://services.sentinel-hub.com/ogc/wms/${THEMES[event.type].instanceId}`,
        selectedLayerId,
      );

      const { lat, lng, zoom } = getMapPosition();
      const WIDTH = 500;
      const HEIGHT = 500;
      const ZOOM = zoom;
      const { x, y } = L.CRS.EPSG4326.latLngToPoint(L.latLng(lat, lng), ZOOM);
      const { lat: south, lng: west } = L.CRS.EPSG4326.pointToLatLng(L.point(x - WIDTH, y + HEIGHT), ZOOM);
      const { lat: north, lng: east } = L.CRS.EPSG4326.pointToLatLng(L.point(x + WIDTH, y - HEIGHT), ZOOM);
      const bbox = new BBox(CRS_EPSG4326, west, south, east, north);

      const newDate = await getPrevNextDate(layer, bbox, direction, currentDate);
      const newVisDates = { ...visualizationDates };
      if (position === 'left') {
        newVisDates.before = [moment.utc(newDate).startOf('day'), moment.utc(newDate).endOf('day')];
      }
      if (position === 'right') {
        newVisDates.after = [moment.utc(newDate).startOf('day'), moment.utc(newDate).endOf('day')];
      }

      setVisualizationParams((prevState) => ({
        ...prevState,
        visualizationDates: newVisDates,
      }));
    }
  }

  function closeFullscreenMap() {
    history.push(`/${event.id}`);
  }
  function openFullscreenMap() {
    history.push(`/${event.id}/map`);
  }

  function handleVisualizationLayerChange() {
    if (windowSize.width < mediumWidth) {
      openFullscreenMap();
    }
  }

  function checkIfCanUseJpeg(layerId) {
    const layer = themeLayers.find((l) => l.layerId === selectedLayerId);

    if (
      !layer ||
      (LAYERS_PNG_ONLY[layer.dataset.id] && LAYERS_PNG_ONLY[layer.dataset.id].includes(layerId))
    ) {
      return false;
    }
    return true;
  }

  function isWMSLayer(layerId) {
    const layer = themeLayers.find((l) => l.layerId === selectedLayerId);
    if (!layer) {
      return false;
    }
    return layer instanceof WmsLayer;
  }

  function getLayerBaseUrl(layerId) {
    const layer = themeLayers.find((l) => l.layerId === selectedLayerId);
    if (!layer) {
      return null;
    }
    return layer.baseUrl;
  }

  async function getVisualizationDates(visualizationDates, eventDate, instanceId, layerId) {
    const isEffisLayer = layerId === EFFIS_VIIRS_FIRES.layerId;

    if (isEffisLayer) {
      const dates = visualizationDates[EFFIS_VIIRS_FIRES.id];
      return {
        before: [moment.utc(dates.before).startOf('day'), moment.utc(dates.before).endOf('day')],
        after: [moment.utc(dates.after).startOf('day'), moment.utc(dates.after).endOf('day')],
        isMultitemporal: false,
        isSingleDate: true,
      };
    }

    const isMundisNO2 = layerId === S5P_TROPOMI_NO2.layerId;

    if (isMundisNO2) {
      const dates = visualizationDates[DATASET_S5PL2.id];
      return {
        before: [moment.utc(dates.before).startOf('day'), moment.utc(dates.before).endOf('day')],
        after: [moment.utc(dates.after).startOf('day'), moment.utc(dates.after).endOf('day')],
        isMultitemporal: false,
        isSingleDate: false,
        onlySupportsToTime: true,
      };
    }

    const layer = await LayersFactory.makeLayer(
      `https://services.sentinel-hub.com/ogc/wms/${instanceId}`,
      layerId,
    );
    await layer.updateLayerFromServiceIfNeeded();
    const isMultitemporal = isEvalscriptMultitemporal(layer.evalscript);

    if (layer && layer.dataset && visualizationDates[layer.dataset.id]) {
      const dates = getAppropriateVisualizationDates(visualizationDates, layer.dataset.id, layerId);
      // used to identify isSingleDateLayer for compare mode
      const isSingleDate = moment.utc(dates.before).isSame(moment.utc(dates.after));
      return {
        before: [moment.utc(dates.before).startOf('day'), moment.utc(dates.before).endOf('day')],
        after: [moment.utc(dates.after).startOf('day'), moment.utc(dates.after).endOf('day')],
        isMultitemporal: isMultitemporal,
        isSingleDate: isSingleDate,
      };
    } else {
      // Since we don't have a specified set of dates, we need to find just some dates available
      // (about a week before and after) and select that.
      // Make some approximate bbox:
      const { lat, lng, zoom } = event;
      const WIDTH = 500;
      const HEIGHT = 500;
      const ZOOM = zoom;
      const { x, y } = L.CRS.EPSG4326.latLngToPoint(L.latLng(lat, lng), ZOOM);
      const { lat: south, lng: west } = L.CRS.EPSG4326.pointToLatLng(L.point(x - WIDTH, y + HEIGHT), ZOOM);
      const { lat: north, lng: east } = L.CRS.EPSG4326.pointToLatLng(L.point(x + WIDTH, y - HEIGHT), ZOOM);
      const bbox = new BBox(CRS_EPSG4326, west, south, east, north);

      const searchFrom = moment.utc(eventDate).subtract(1, 'week').startOf('day');
      const searchTo = moment.utc(eventDate).add(1, 'week').endOf('day');
      const dates = await layer.findDatesUTC(bbox, searchFrom, searchTo);
      return {
        before: [
          moment.utc(dates[dates.length - 1]).startOf('day'),
          moment.utc(dates[dates.length - 1]).endOf('day'),
        ],
        after: [moment.utc(dates[0]).startOf('day'), moment.utc(dates[0]).endOf('day')],
        isMultitemporal: isMultitemporal,
      };
    }
  }

  async function changeVisualizationLayer(selectedLayerId) {
    const visualizationDates = await getVisualizationDates(
      event.visualizationDates,
      event.date,
      THEMES[event.type].instanceId,
      selectedLayerId,
    );
    setVisualizationParams((prevState) => ({
      ...prevState,
      visualizationDates: visualizationDates,
      selectedLayerId: selectedLayerId,
    }));
  }

  const { selectedLayerId, visualizationDates } = visualizationParams;

  const canUseJpeg = checkIfCanUseJpeg(selectedLayerId);
  const isSelectedLayerWMS = isWMSLayer(selectedLayerId);

  if (error) {
    return (
      <div className="event-page">
        <div className={`event-info`}>
          <div className="event-list-item-header">
            <div className="event-mark-wrapper">
              <div className={`event-mark`}></div>
            </div>
            <div className="event-title">Problem loading event</div>
            <div className="back-to-list">
              <Link className="cross" to="/">
                <div className="left">
                  <div className="right"></div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event || !visualizationDates || !selectedLayerId) {
    return <></>;
  }

  if (windowSize.width < mediumWidth && !isFullscreenMap) {
    return (
      <div className="event-page">
        <EventInfo
          {...event}
          visualizations={themeLayers}
          layerId={selectedLayerId}
          selectedLayerId={selectedLayerId}
          onVisualizationLayerChange={handleVisualizationLayerChange}
          setSelectedLayerId={changeVisualizationLayer}
          setMapPosition={setMapPosition}
          getMapPosition={getMapPosition}
        />
      </div>
    );
  }

  if (windowSize.width > mediumWidth && !isFullscreenMap) {
    return (
      <div className="event-page">
        <Map
          selectedEvent={event}
          layerId={selectedLayerId}
          instanceId={THEMES[event.type].instanceId}
          visualizationDates={visualizationDates}
          getAndSetPrevNextDate={getAndSetPrevNextDate}
          onCloseFullscreenMap={closeFullscreenMap}
          onOpenFullscreenMap={openFullscreenMap}
          setMapInstance={setMapInstance}
          setMapPosition={setMapPosition}
          zoom={event.zoom}
          isFullscreenMap={isFullscreenMap}
          canUseJpeg={canUseJpeg}
          isWMS={isSelectedLayerWMS}
          baseUrl={getLayerBaseUrl(selectedLayerId)}
        />
        <EventInfo
          {...event}
          visualizations={themeLayers}
          layerId={selectedLayerId}
          selectedLayerId={selectedLayerId}
          onVisualizationLayerChange={handleVisualizationLayerChange}
          setSelectedLayerId={changeVisualizationLayer}
          setMapPosition={setMapPosition}
          getMapPosition={getMapPosition}
        />
      </div>
    );
  }

  return (
    <div className="event-page">
      <Map
        selectedEvent={event}
        layerId={selectedLayerId}
        instanceId={THEMES[event.type].instanceId}
        visualizationDates={visualizationDates}
        getAndSetPrevNextDate={getAndSetPrevNextDate}
        onCloseFullscreenMap={closeFullscreenMap}
        onOpenFullscreenMap={openFullscreenMap}
        setMapInstance={setMapInstance}
        setMapPosition={setMapPosition}
        zoom={event.zoom}
        isFullscreenMap={isFullscreenMap}
        canUseJpeg={canUseJpeg}
        isWMS={isSelectedLayerWMS}
        baseUrl={getLayerBaseUrl(selectedLayerId)}
      />
    </div>
  );
}

export default EventPage;
