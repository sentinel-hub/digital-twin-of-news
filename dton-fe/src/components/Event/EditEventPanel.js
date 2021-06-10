import React, { useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import {
  DATASET_S2L1C,
  DATASET_S2L2A,
  DATASET_S3SLSTR,
  DATASET_AWSEU_S1GRD,
  DATASET_S5PL2,
} from '@sentinel-hub/sentinelhub-js';

import { EFFIS_VIIRS_FIRES } from '../../const';

import './EditEventPanel.scss';

const DATASETS_USED = [
  DATASET_S2L2A.id,
  DATASET_S2L1C.id,
  DATASET_S3SLSTR.id,
  DATASET_AWSEU_S1GRD.id,
  EFFIS_VIIRS_FIRES.id,
  DATASET_S5PL2.id,
];

const PRODUCTS = {
  [DATASET_S5PL2.id]: ['CO', 'HCHO', 'NO2', 'O3', 'SO2', 'CH4', 'AER_AI_340_380', 'AER_AI_354_388'],
};

function getProductSpecificDate(dates, datasetId, product) {
  return (
    dates[datasetId] &&
    dates[datasetId].productSpecificDates &&
    dates[datasetId].productSpecificDates[product]
  );
}

function getAllProductSpecificDates(dates) {
  const allProductSpecificDates = {};
  for (let datasetId in dates) {
    if (dates[datasetId].productSpecificDates) {
      allProductSpecificDates[datasetId] = Object.keys(dates[datasetId].productSpecificDates);
    }
  }
  return allProductSpecificDates;
}

function EditEventPanel(props) {
  const {
    defaultApiKey,
    defaultLat,
    defaultLng,
    defaultZoom,
    originalVisualizationDates,
    overrideVisualizationDates,
    originalConfirmed,
    overrideConfirmed,
    eventId,
    eventDate,
  } = props;
  const [apiKey, setApiKey] = useState(defaultApiKey);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [zoom, setZoom] = useState('');
  const [datasetsWithVisualizationDatesOverrides, setDatasetsWithVisualizationDatesOverrides] = useState(
    Object.keys(overrideVisualizationDates),
  );
  const [productsWithVisualizationDatesOverrides, setProductsWithVisualizationDatesOverrides] = useState(
    getAllProductSpecificDates(overrideVisualizationDates),
  );
  const [visualizationDates, setVisualizationDates] = useState({ ...overrideVisualizationDates });
  const [confirmed, setConfirmed] = useState(JSON.stringify(overrideConfirmed));
  const [error, setError] = useState();
  const [explanation, setExplanation] = useState('');

  function editEvent() {
    const payload = {
      overrideConfirmed: JSON.parse(confirmed),
    };
    if (lat !== '') {
      payload['overrideLat'] = lat;
    }
    if (lng !== '') {
      payload['overrideLng'] = lng;
    }
    if (zoom !== '') {
      payload['overrideZoom'] = zoom;
    }

    payload['overrideVisualizationDates'] = {
      ...visualizationDates,
    };
    // remove all of the dates that don't have their checkbox checked:
    for (let d of DATASETS_USED) {
      if (!datasetsWithVisualizationDatesOverrides.includes(d)) {
        delete payload['overrideVisualizationDates'][d];
      }
    }

    if (explanation) {
      payload['explanation'] = explanation;
    }

    if (Object.keys(payload).length === 0) {
      setError('No edits were made');
      return;
    }
    makeOverrideRequest(payload);
  }

  async function makeOverrideRequest(payload) {
    const config = {
      headers: {
        'x-api-key': apiKey,
      },
      validateStatus: () => true,
    };
    const response = await axios.patch(
      `${process.env.REACT_APP_DTON_API_ROOT_URL}/v1/events/${eventId}/override`,
      payload,
      config,
    );
    if (response.status >= 200 && response.status < 300) {
      window.location.reload();
    } else {
      setError(`Error ${response.status}: ${response.data.detail}`);
    }
  }

  function copyFromMap() {
    const { lat, lng, zoom } = props.getMapPosition();
    setLat(lat);
    setLng(lng);
    setZoom(zoom);
  }

  function setOriginalPosition() {
    setLat(defaultLat);
    setLng(defaultLng);
    setZoom(defaultZoom);
    props.setMapPosition([defaultLat, defaultLng], defaultZoom);
  }

  function handleOverrideVisualizationDateCheckbox(ev) {
    const datasetId = ev.target.value;
    if (ev.target.checked) {
      // if needed, initialize the visualization dates first:
      if (!visualizationDates[datasetId]) {
        setVisualizationDates((prevState) => ({
          ...prevState,
          [datasetId]: {
            before: eventDate.format('YYYY-MM-DD'),
            after: eventDate.format('YYYY-MM-DD'),
          },
        }));
      }
      setDatasetsWithVisualizationDatesOverrides([...datasetsWithVisualizationDatesOverrides, datasetId]);
    } else {
      setDatasetsWithVisualizationDatesOverrides(
        datasetsWithVisualizationDatesOverrides.filter((d) => d !== datasetId),
      );
    }
  }

  function handleOverrideProductVisualizationDateCheckbox(ev) {
    const { datasetId, product } = JSON.parse(ev.target.value);
    if (ev.target.checked) {
      if (!getProductSpecificDate(visualizationDates, datasetId, product)) {
        setVisualizationDates((prevState) => {
          const newState = { ...prevState };
          if (!newState[datasetId].productSpecificDates) {
            newState[datasetId].productSpecificDates = {};
          }
          newState[datasetId].productSpecificDates[product] = {
            before: eventDate.format('YYYY-MM-DD'),
            after: eventDate.format('YYYY-MM-DD'),
          };
          return newState;
        });
      }
      setProductsWithVisualizationDatesOverrides((prevState) => {
        if (!prevState[datasetId]) {
          return { ...prevState, [datasetId]: [product] };
        }
        return { ...prevState, [datasetId]: [...prevState[datasetId], product] };
      });
    } else {
      if (getProductSpecificDate(visualizationDates, datasetId, product)) {
        setVisualizationDates((prevState) => {
          const newState = { ...prevState };
          delete newState[datasetId].productSpecificDates[product];
          return newState;
        });
      }
      setProductsWithVisualizationDatesOverrides((prevState) => {
        return { ...prevState, [datasetId]: prevState[datasetId].filter((p) => p !== product) };
      });
    }
  }

  function setVisualizationDate(datasetId, before, value, product = null) {
    setVisualizationDates((prevState) => {
      const newState = { ...prevState };
      if (product !== null) {
        newState[datasetId].productSpecificDates[product][before ? 'before' : 'after'] = value;
      } else {
        newState[datasetId][before ? 'before' : 'after'] = value;
      }
      return newState;
    });
  }

  if (!apiKey) {
    return null;
  }

  return (
    <div className="edit-event-form">
      <div className="edit-event-form-title">Edit event</div>

      <div className="line api-key">
        <label htmlFor="api-key">API key: </label>
        <input type="text" id="api-key" value={apiKey} onChange={(ev) => setApiKey(ev.target.value)} />
      </div>

      <div className="line">
        <label htmlFor="lat">Lat: </label>
        <input type="number" id="lat" value={lat} onChange={(ev) => setLat(ev.target.value)} />
      </div>

      <div className="line">
        <label htmlFor="lng">Lng: </label>
        <input type="number" id="lng" value={lng} onChange={(ev) => setLng(ev.target.value)} />
      </div>

      <div className="line">
        <label htmlFor="zoom">Zoom: </label>
        <input type="number" id="zoom" value={zoom} onChange={(ev) => setZoom(ev.target.value)} />
      </div>

      <div className="position-buttons">
        <button className="copy-from-map" onClick={copyFromMap}>
          Use Map Position
        </button>
        <button className="original-position" onClick={setOriginalPosition}>
          Original Position
        </button>
      </div>

      <h3 className="dates-title">Dates</h3>
      {DATASETS_USED.map((datasetId) => (
        <div className="vis-dates" key={datasetId}>
          <div className="dataset-name">{datasetId}: </div>
          <div className="original-date current-status">
            {originalVisualizationDates[datasetId]
              ? `original: ${originalVisualizationDates[datasetId].before} / ${originalVisualizationDates[datasetId].after}`
              : 'not set'}
          </div>
          <div className="override">
            <label htmlFor={`override-vis-date-${datasetId}`}>Override: </label>
            <input
              type="checkbox"
              value={datasetId}
              checked={datasetsWithVisualizationDatesOverrides.includes(datasetId)}
              onChange={handleOverrideVisualizationDateCheckbox}
            />
            {datasetsWithVisualizationDatesOverrides.includes(datasetId) && (
              <div className="dates">
                <div className="line">
                  <label htmlFor={`vis-date-before-${datasetId}`}>Before: </label>
                  <input
                    type="date"
                    id={`vis-date-before-${datasetId}`}
                    value={visualizationDates[datasetId].before}
                    onChange={(ev) => setVisualizationDate(datasetId, true, ev.target.value)}
                  />
                </div>
                <div className="line">
                  <label htmlFor={`vis-date-after-${datasetId}`}>After: </label>
                  <input
                    type="date"
                    id={`vis-date-after-${datasetId}`}
                    value={visualizationDates[datasetId].after}
                    onChange={(ev) => setVisualizationDate(datasetId, false, ev.target.value)}
                  />
                </div>
                {PRODUCTS[datasetId] &&
                  PRODUCTS[datasetId].map((product) => (
                    <div className="product-dates" key={product}>
                      <div className="product-name">
                        <input
                          type="checkbox"
                          value={JSON.stringify({ datasetId: datasetId, product: product })}
                          checked={
                            productsWithVisualizationDatesOverrides[datasetId] &&
                            productsWithVisualizationDatesOverrides[datasetId].includes(product)
                          }
                          onChange={handleOverrideProductVisualizationDateCheckbox}
                        />
                        {product}:
                      </div>

                      <div className="original-date current-status">
                        {getProductSpecificDate(originalVisualizationDates, datasetId, product)
                          ? `original: ${
                              getProductSpecificDate(originalVisualizationDates, datasetId, product).before
                            } / ${
                              getProductSpecificDate(originalVisualizationDates, datasetId, product).after
                            }`
                          : 'not set'}
                      </div>
                      {productsWithVisualizationDatesOverrides[datasetId] &&
                        productsWithVisualizationDatesOverrides[datasetId].includes(product) && (
                          <>
                            <div className="line">
                              <label htmlFor={`vis-date-before-${datasetId}-${product}`}>Before: </label>
                              <input
                                type="date"
                                id={`vis-date-before-${datasetId}-${product}`}
                                value={
                                  getProductSpecificDate(visualizationDates, datasetId, product)
                                    ? getProductSpecificDate(visualizationDates, datasetId, product).before
                                    : eventDate.format('YYYY-MM-DD')
                                }
                                onChange={(ev) =>
                                  setVisualizationDate(datasetId, true, ev.target.value, product)
                                }
                              />
                            </div>
                            <div className="line">
                              <label htmlFor={`vis-date-after-${datasetId}-${product}`}>After: </label>
                              <input
                                type="date"
                                id={`vis-date-after-${datasetId}-${product}`}
                                value={
                                  getProductSpecificDate(visualizationDates, datasetId, product)
                                    ? getProductSpecificDate(visualizationDates, datasetId, product).after
                                    : eventDate.format('YYYY-MM-DD')
                                }
                                onChange={(ev) =>
                                  setVisualizationDate(datasetId, false, ev.target.value, product)
                                }
                              />
                            </div>
                          </>
                        )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="line confirmed">
        <label htmlFor="confirmed">Manual confirmation: </label>
        <select id="confirmed" value={confirmed} onChange={(ev) => setConfirmed(ev.target.value)}>
          <option value="true">true (valid event)</option>
          <option value="false">false (not valid event)</option>
          <option value="null">not manually confirmed yet</option>
        </select>
      </div>

      <div className="current-confirmed-status current-status">
        Original status: {JSON.stringify(originalConfirmed)}{' '}
        {originalConfirmed === null && ' (not decided yet)'}
      </div>
      <div className="audit-trail-comment">
        <label className="audit-trail-label" htmlFor="explanation">
          Reason for the changes: (optional)
        </label>
        <textarea
          id="explanation"
          placeholder="Your comment here..."
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
        ></textarea>
      </div>
      <div className="submit-buttons">
        <button onClick={editEvent}>Submit</button>
      </div>

      {error && <textarea className="edit-panel-error-panel" value={error} readOnly />}
    </div>
  );
}

const mapStoreToProps = (store) => ({
  defaultApiKey: store.auth.apiKey,
});

export default connect(mapStoreToProps, null)(EditEventPanel);
