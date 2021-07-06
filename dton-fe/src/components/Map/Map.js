import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Pane, ScaleControl } from 'react-leaflet';
import L from 'leaflet';

import CompareLayersComp from './CompareLayersComp';
import SentinelHubLayerComponent from './plugins/sentinelhubLayer';
import Legend from '../Legend/Legend';

import 'nprogress/nprogress.css';
import 'leaflet/dist/leaflet.css';
import './Map.scss';

import visualizationPreview from '../../assets/satellitePreview.png';
import OSMPreview from '../../assets/osmPreview.png';

const baseLayer = {
  name: 'Carto Voyager',
  url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
  attribution: 'Carto © CC BY 3.0, OpenStreetMap © ODbL',
  checked: true,
};
const BASE_PANE_ID = 'baseMapPane';
const BASE_PANE_ZINDEX = 0;
const SENTINELHUB_LAYER_PANE_ID = 'sentinelhubPane';
const SENTINELHUB_LAYER_PANE_ZINDEX = 500;

function Map({
  selectedEvent,
  instanceId,
  layerId,
  visualizationDates,
  getAndSetPrevNextDate,
  onOpenFullscreenMap,
  onCloseFullscreenMap,
  setMapInstance,
  setMapPosition,
  zoom,
  isFullscreenMap,
  canUseJpeg,
  isWMS,
  baseUrl,
}) {
  const [showingLayers, setShowingLayers] = useState(true);
  const beforeSensing = useRef(null);
  const afterSensing = useRef(null);

  useEffect(() => {
    setShowingLayers(true);
  }, [layerId]);

  function mapCreated(map) {
    map.zoomControl.remove();
    L.control
      .attribution({
        position: 'bottomleft',
      })
      .addTo(map);
    setMapInstance(map);
  }

  const areDatesEqual =
    visualizationDates &&
    visualizationDates.before[0].isSame(visualizationDates.after[0]) &&
    visualizationDates.before[1].isSame(visualizationDates.after[1]);

  const isMultitemporal = visualizationDates && visualizationDates.isMultitemporal;
  const isSingleDateLayer = visualizationDates && visualizationDates.isSingleDate;
  const onlySupportsToTime = visualizationDates && visualizationDates.onlySupportsToTime;

  return (
    <MapContainer
      key={selectedEvent.id}
      center={[selectedEvent.lat, selectedEvent.lng]}
      zoom={zoom}
      minZoom={3}
      whenCreated={mapCreated}
      attributionControl={false}
      tap={false}
    >
      <Pane name={BASE_PANE_ID} style={{ zIndex: BASE_PANE_ZINDEX }} />
      <Pane name={SENTINELHUB_LAYER_PANE_ID} style={{ zIndex: SENTINELHUB_LAYER_PANE_ZINDEX }} />
      <TileLayer url={baseLayer.url} attribution={baseLayer.attribution} pane={BASE_PANE_ID} />
      {showingLayers && visualizationDates && !isMultitemporal && (
        <CompareLayersComp
          dates={[visualizationDates.before[0], visualizationDates.after[0]]}
          getAndSetPrevNextDate={getAndSetPrevNextDate}
          equalDates={areDatesEqual}
          isSingleDateLayer={isSingleDateLayer}
        >
          {!isMultitemporal && !isSingleDateLayer && (
            <SentinelHubLayerComponent
              ref={beforeSensing}
              layers={layerId}
              url={isWMS ? baseUrl : `https://services.sentinel-hub.com/ogc/wms/${instanceId}`}
              format="PNG"
              fromTime={onlySupportsToTime ? null : visualizationDates.before[0]}
              toTime={visualizationDates.before[1]}
              customSelected={false}
              canUseJpeg={canUseJpeg}
              isWMS={isWMS}
              pane={SENTINELHUB_LAYER_PANE_ID}
            />
          )}
          <SentinelHubLayerComponent
            ref={afterSensing}
            layers={layerId}
            url={isWMS ? baseUrl : `https://services.sentinel-hub.com/ogc/wms/${instanceId}`}
            format="PNG"
            fromTime={onlySupportsToTime ? null : visualizationDates.after[0]}
            toTime={visualizationDates.after[1]}
            customSelected={false}
            canUseJpeg={canUseJpeg}
            isWMS={isWMS}
            pane={SENTINELHUB_LAYER_PANE_ID}
          />
        </CompareLayersComp>
      )}
      {isMultitemporal && (
        <SentinelHubLayerComponent
          layers={layerId}
          url={`https://services.sentinel-hub.com/ogc/wms/${instanceId}`}
          format="PNG"
          fromTime={visualizationDates.before[0]}
          toTime={visualizationDates.after[1]}
          customSelected={false}
          canUseJpeg={canUseJpeg}
          pane={SENTINELHUB_LAYER_PANE_ID}
        />
      )}
      <div className="icon-wrap-bottom-right">
        {isFullscreenMap ? (
          <div className="collapse-map">
            <i onClick={onCloseFullscreenMap} className="fas fa-compress" />
          </div>
        ) : (
          <div className="collapse-map">
            <i onClick={onOpenFullscreenMap} className="fas fa-expand"></i>
          </div>
        )}
        <div className="back-to-start">
          <i
            onClick={() => setMapPosition([selectedEvent.lat, selectedEvent.lng], zoom)}
            className="fas fa-crosshairs"
          />
        </div>
      </div>
      <div className="switch-osm-layer">
        <div onClick={() => setShowingLayers((showingLayers) => !showingLayers)}>
          <div className="title">{showingLayers ? 'OSM' : 'Satellite'}</div>
          <img src={showingLayers ? OSMPreview : visualizationPreview} alt="" />
        </div>
      </div>
      <Legend layerId={layerId} eventType={selectedEvent.type} />
      <ScaleControl position="bottomright" imperial={false} />
    </MapContainer>
  );
}

export default Map;
