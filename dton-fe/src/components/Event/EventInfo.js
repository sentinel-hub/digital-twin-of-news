import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import {
  ApiType,
  BBox,
  CRS_EPSG4326,
  MimeTypes,
  CancelToken,
  isCancelled,
  DATASET_AWSEU_S1GRD,
  WmsLayer,
} from '@sentinel-hub/sentinelhub-js';
import moment from 'moment';
import { connect } from 'react-redux';

import LocationMap from './LocationMap';
import EditEventPanel from './EditEventPanel';
import EventArticles from './EventArticles';
import { getAppropriateClassName, getAppropriateVisualizationDates } from '../../utils/events.utils';
import { isEvalscriptMultitemporal } from '../../utils/parseEvalscript';
import { EOB_THEMES_FOR_TYPE, SH_TO_EOB_ID } from '../../const';

import './EventInfo.scss';
import VisualizationPreview from './VisualizationPreview';
import { layersInfo } from '../../utils/layersInfo';

function EventInfo(props) {
  const [visualizationPreviews, setVisualizationPreviews] = useState({});
  const {
    id,
    type,
    title,
    date,
    apiKey,
    exactLocationName,
    locationName,
    description,
    lat,
    lng,
    zoom,
    articles,
    visualizations,
    auditTrail,
    selectedLayerId,
    setSelectedLayerId,
    overrideConfirmed,
    originalConfirmed,
    visualizationDates,
    originalVisualizationDates,
    overrideVisualizationDates,
    onVisualizationLayerChange,
    infoHighlights = [],
  } = props;
  const EOBUrl = constructEOBUrl();
  const token = new CancelToken();
  const mainArticle = getMainArticle(articles, title);
  sortArticles(articles, title);

  useEffect(() => {
    async function getVisualizationPreviews() {
      for (let visualization of props.visualizations) {
        try {
          const blob = await getPreview(visualization);
          const url = URL.createObjectURL(blob);
          setVisualizationPreviews((visualizationPreviews) => ({
            ...visualizationPreviews,
            [visualization.layerId]: url,
          }));
        } catch (err) {
          if (!isCancelled(err)) {
            throw err;
          }
        }
      }
    }
    getVisualizationPreviews();

    return () => {
      for (let layerId in visualizationPreviews) {
        URL.revokeObjectURL(visualizationPreviews[layerId]);
      }
      token.cancel();
    };
    // eslint-disable-next-line
  }, [props.visualizations, visualizationDates]);

  async function getPreview(layer) {
    const { lat, lng, zoom, visualizationDates, date } = props;
    const WIDTH = 600;
    const HEIGHT = 200;
    const ZOOM = zoom + 2;
    const { x, y } = L.CRS.EPSG4326.latLngToPoint(L.latLng(lat, lng), ZOOM);
    const { lat: south, lng: west } = L.CRS.EPSG4326.pointToLatLng(L.point(x - WIDTH, y + HEIGHT), ZOOM);
    const { lat: north, lng: east } = L.CRS.EPSG4326.pointToLatLng(L.point(x + WIDTH, y - HEIGHT), ZOOM);
    const bbox = new BBox(CRS_EPSG4326, west, south, east, north);

    const isConstructedWMS = layer instanceof WmsLayer;

    let isMultitemporal = false;
    if (!isConstructedWMS) {
      await layer.updateLayerFromServiceIfNeeded();
      isMultitemporal = isEvalscriptMultitemporal(layer.evalscript);
    }

    let fromTime, toTime;

    const dates = getAppropriateVisualizationDates(visualizationDates, layer.dataset.id, layer.layerId);

    if (dates) {
      if (isMultitemporal) {
        fromTime = moment.utc(dates.before).startOf('day');
        toTime = moment.utc(dates.after).endOf('day');
      } else {
        fromTime = moment.utc(dates.after).startOf('day');
        toTime = moment.utc(dates.after).endOf('day');
      }
    } else {
      fromTime = date.clone().subtract(1, 'week').startOf('day');
      toTime = date.clone().endOf('day');
    }

    const getMapParams = {
      bbox: bbox,
      fromTime: fromTime,
      toTime: toTime,
      width: WIDTH,
      height: HEIGHT,
      format: MimeTypes.JPEG,
      preview: 2,
      showlogo: false,
    };
    const requestsConfig = {
      cancelToken: token,
      cache: { expiresIn: Number.POSITIVE_INFINITY },
    };
    return layer.getMap(getMapParams, isConstructedWMS ? ApiType.WMS : ApiType.PROCESSING, requestsConfig);
  }

  function constructEOBUrl() {
    const { type, lat, lng, zoom, date, selectedLayerId, visualizationDates, visualizations } = props;

    const layer = visualizations.find((l) => l.layerId === selectedLayerId);
    const datasetId = layer.dataset.id;
    const EOBDatasetId = SH_TO_EOB_ID(datasetId, layer.layerId);

    let evalscript;
    if (EOBDatasetId === 'S3SLSTR' || datasetId === DATASET_AWSEU_S1GRD.id) {
      evalscript = layer.evalscript;
    }

    const dates = getAppropriateVisualizationDates(visualizationDates, datasetId, selectedLayerId);

    const fromTime = dates
      ? moment.utc(dates.after).startOf('day')
      : date.clone().subtract(1, 'week').startOf('day');
    const toTime = dates ? moment.utc(dates.after).endOf('day') : date.clone().endOf('day');

    return `https://apps.sentinel-hub.com/eo-browser/?zoom=${zoom}&lat=${lat}&lng=${lng}&fromTime=${fromTime.toISOString()}&toTime=${toTime.toISOString()}&themeId=${
      EOB_THEMES_FOR_TYPE[type][datasetId]
    }&datasetId=${EOBDatasetId}&${
      evalscript ? `evalscript=${btoa(evalscript)}#custom-script` : `layerId=${selectedLayerId}`
    }`;
  }

  function getMainArticle(articles, title) {
    return articles.find((article) => article.title === title);
  }

  function sortArticles(articles, title) {
    articles.sort((a, b) => {
      if (a.title === title) {
        return -1;
      }
      if (b.title === title) {
        return 1;
      }
      return 0;
    });
  }
  return (
    <div className="event-info">
      <div className="event-list-item-header">
        <div className="event-mark-wrapper">
          <div
            className={`event-mark ${type} ${getAppropriateClassName(originalConfirmed, overrideConfirmed)}`}
          ></div>
        </div>
        <div className="event-title">{title}</div>
        <div className="back-to-list">
          <Link className="cross" to="/">
            <div className="left">
              <div className="right"></div>
            </div>
          </Link>
        </div>
      </div>

      <div className="overview">
        {exactLocationName && <div className="event-exact-location-name">{exactLocationName}</div>}
        {locationName && <div className="event-location-name">{locationName}</div>}
        <div className="event-date">{date.clone().utc().format('YYYY-MM-DD')}</div>
      </div>

      <LocationMap type={type} lat={lat} lng={lng} />

      <EditEventPanel
        key={id}
        eventId={id}
        eventDate={date}
        defaultLat={lat}
        defaultLng={lng}
        defaultZoom={zoom}
        originalVisualizationDates={originalVisualizationDates}
        overrideVisualizationDates={overrideVisualizationDates}
        originalConfirmed={originalConfirmed}
        overrideConfirmed={overrideConfirmed}
        getMapPosition={props.getMapPosition}
        setMapPosition={props.setMapPosition}
      />

      {apiKey && (
        <div className="histories">
          <h3>History</h3>

          {auditTrail ? (
            <div className="history-list">
              {auditTrail.length > 0 ? (
                <div>
                  <div className="history-list-last-change">
                    <div>Last change:</div>
                    <div>
                      <div>
                        <div className="history-username">
                          {auditTrail[auditTrail.length - 1].admin
                            ? auditTrail[auditTrail.length - 1].admin.username
                            : 'superadmin'}
                        </div>
                      </div>
                      <div className="history-created-at">
                        {moment(auditTrail[auditTrail.length - 1].created).format('YYYY-MM-DD, HH:MM')}
                      </div>
                    </div>
                  </div>
                  <details>
                    <summary className="history-summary">View Changes Details</summary>
                    {auditTrail
                      .slice()
                      .reverse()
                      .map(({ created, admin, explanation, id }) => (
                        <div key={id} className="history">
                          <div className="">
                            <div>
                              <div className="history-username">{admin ? admin.username : 'superadmin'}</div>
                              <div className="history-created-at">
                                {moment(created).format('YYYY-MM-DD, HH:MM')}
                              </div>
                            </div>
                          </div>
                          <div className="history-explanation">
                            {explanation ? explanation : 'No explanation given'}
                          </div>
                        </div>
                      ))}
                  </details>
                </div>
              ) : (
                <div>No records available</div>
              )}
            </div>
          ) : (
            <div>Could not fetch audit trail (invalid API key?)</div>
          )}
        </div>
      )}

      <h3 className="event-description">Description</h3>
      <div className="description">{`“${description}”`}</div>

      {mainArticle && mainArticle.source && (
        <div className="main-article">
          <a
            className="main-article-link"
            href={mainArticle.url}
            rel="noreferrer noopener"
            target="_blank"
            title={mainArticle.title}
          >
            {mainArticle.source}
          </a>
        </div>
      )}

      <div className="visualizations">
        {visualizations.map(({ layerId, title }, i) => (
          <VisualizationPreview
            layerId={layerId}
            title={title}
            key={i}
            isSelected={selectedLayerId === layerId}
            information={layersInfo[layerId]}
            image={visualizationPreviews[layerId]}
            onLayerClick={(layerId) => {
              setSelectedLayerId(layerId);
              onVisualizationLayerChange();
            }}
          />
        ))}
      </div>

      <div className="info-highlights">
        {infoHighlights.map(({ title, value, description }, i) => (
          <div className="info-highlight" key={i}>
            <div className="title">{title}</div>
            <div className="value">{value}</div>
            {description && <div className="description">{description(date.utc().format('YYYY-MM-DD'))}</div>}
            <div className="line-break" />
          </div>
        ))}
      </div>

      <EventArticles articles={articles} />

      <div className="explore-data">
        <a className="explore-eo-data-button" href={EOBUrl} rel="noreferrer noopener" target="_blank">
          <span className="title">Explore EO data</span>
        </a>
      </div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  apiKey: store.auth.apiKey,
});

export default connect(mapStoreToProps, null)(EventInfo);
