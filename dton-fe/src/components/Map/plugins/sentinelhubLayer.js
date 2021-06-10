import L from 'leaflet';
import { createLayerComponent } from '@react-leaflet/core';
import isEqual from 'fast-deep-equal';
import {
  LayersFactory,
  ApiType,
  BBox,
  CRS_EPSG3857,
  CRS_EPSG4326,
  MimeTypes,
  CancelToken,
  isCancelled,
  WmsLayer,
} from '@sentinel-hub/sentinelhub-js';
import union from '@turf/union';
import booleanContains from '@turf/boolean-contains';
import NProgress from 'nprogress';

export class SentinelHubLayer extends L.TileLayer {
  constructor(options, extraOptions) {
    super(options);
    const defaultOptions = {
      tileSize: 512,
      format: MimeTypes.JPEG,
      attribution: '&copy; <a href="https://www.sentinel-hub.com" target="_blank">Sentinel Hub</a>',
      preview: 2,
      transparent: true,
    };
    const {
      url,
      layers,
      evalscript,
      evalscripturl,
      dataFusion,
      fromTime,
      toTime,
      datasetId,
      customSelected,
      minQa,
      upsampling,
      downsampling,
      isWMS,
    } = options;

    this.layer = this.createLayer(url, {
      datasetId: datasetId,
      evalscript: evalscript,
      evalscripturl: evalscripturl,
      dataFusion: dataFusion,
      fromTime: fromTime,
      toTime: toTime,
      layer: layers,
      customSelected: customSelected,
      minQa: minQa,
      upsampling: upsampling,
      downsampling: downsampling,
      isWMS: isWMS,
    });

    const mergedOptions = Object.assign(defaultOptions, options);
    L.setOptions(this, mergedOptions);
  }

  onAdd = (map) => {
    this._initContainer();
    this._crs = this.options.crs || map.options.crs;
    L.TileLayer.prototype.onAdd.call(this, map);
  };

  onRemove = () => {
    if (!this._map) {
      return this;
    }
    this._removeAllTiles();
    this.getContainer().style.clip = '';
    L.DomUtil.remove(this._container);
    this._map = null;

    return this;
  };

  constructBBoxFromCoords = (coords, tileSize, bboxCrs) => {
    let bbox;
    const nwPoint = coords.multiplyBy(tileSize);
    const sePoint = nwPoint.add([tileSize, tileSize]);

    if (bboxCrs === CRS_EPSG3857) {
      const nw = L.CRS.EPSG3857.project(this._map.unproject(nwPoint, coords.z));
      const se = L.CRS.EPSG3857.project(this._map.unproject(sePoint, coords.z));
      bbox = new BBox(CRS_EPSG3857, nw.x, se.y, se.x, nw.y);
    } else if (bboxCrs === CRS_EPSG4326) {
      const nw = L.CRS.EPSG4326.project(this._map.unproject(nwPoint, coords.z));
      const se = L.CRS.EPSG4326.project(this._map.unproject(sePoint, coords.z));
      bbox = new BBox(CRS_EPSG4326, nw.x, se.y, se.x, nw.y);
    }
    return bbox;
  };

  getAppropriateFormat = async (coords, layer, tileGeometry, fromTime, toTime, tileSize, cancelToken) => {
    const CUTOFF_ZOOM = 8;
    const { z } = coords;

    if (z < CUTOFF_ZOOM) {
      return MimeTypes.PNG;
    }

    const nTilesInRequestedArea = Math.pow(2, z - CUTOFF_ZOOM);
    coords.x = Math.floor(coords.x / nTilesInRequestedArea);
    coords.y = Math.floor(coords.y / nTilesInRequestedArea);
    coords.z = CUTOFF_ZOOM;
    const bbox = this.constructBBoxFromCoords(coords, tileSize, CRS_EPSG4326);

    const reqConfig = {
      cancelToken: cancelToken,
      cache: { expiresIn: Number.POSITIVE_INFINITY },
    };
    const res = await layer.findTiles(bbox, fromTime, toTime, 50, 0, reqConfig);

    if (res.tiles.length === 0) {
      return MimeTypes.PNG;
    }

    let currentUnion = res.tiles[0].geometry;
    for (let i = 1; i < res.tiles.length; i++) {
      currentUnion = union(currentUnion, res.tiles[i].geometry);
    }

    const tilePolygons = [];

    if (currentUnion.geometry.type === 'MultiPolygon') {
      // For larger time periods, the tiles inside the enveloping tile might be a MultiPolygon
      // booleanContains doesn't support that, so we split it in polygon and check if the requested image is inside one of them
      for (let polygon of currentUnion.geometry.coordinates) {
        tilePolygons.push({ type: 'Polygon', coordinates: polygon });
      }
    } else {
      tilePolygons.push(currentUnion);
    }

    const isTileContained = tilePolygons.some((p) => booleanContains(p, tileGeometry));

    if (isTileContained) {
      return MimeTypes.JPEG;
    }
    return MimeTypes.PNG;
  };

  createTile = (coords, done) => {
    const tile = L.DomUtil.create('img', 'leaflet-tile');
    tile.width = this.options.tileSize;
    tile.height = this.options.tileSize;
    const cancelToken = new CancelToken();
    tile.cancelToken = cancelToken;
    const tileSize = this.options.tileSize;
    const bbox = this.constructBBoxFromCoords(coords, tileSize, CRS_EPSG3857);

    const individualTileParams = { ...this.options, width: tileSize, height: tileSize };
    individualTileParams.bbox = bbox;

    this.layer.then(async (layer) => {
      if (!layer.evalscript && !layer.evalscriptUrl && !this.options.isWMS) {
        try {
          await layer.updateLayerFromServiceIfNeeded({ cancelToken: cancelToken });
        } catch (error) {
          if (!isCancelled(error)) {
            console.error('There has been a problem with your fetch operation: ', error.message);
          }
        }
      }

      let format = MimeTypes.PNG;
      if (this.options.canUseJpeg) {
        let bbox, tileGeometry;
        try {
          bbox = this.constructBBoxFromCoords(coords, tileSize, CRS_EPSG4326);
          tileGeometry = bbox.toGeoJSON();
        } catch (e) {
          return;
        }
        try {
          format = await this.getAppropriateFormat(
            coords,
            layer,
            tileGeometry,
            individualTileParams.fromTime,
            individualTileParams.toTime,
            this.options.tileSize,
            cancelToken,
          );
        } catch (err) {
          if (!isCancelled(err)) {
            console.error('There has been a problem fetching tile info: ', err.message);
          }
        }
      }

      individualTileParams['format'] = format;

      const apiType = layer.supportsApiType(ApiType.PROCESSING) ? ApiType.PROCESSING : ApiType.WMS;
      layer
        .getMap(individualTileParams, apiType, {
          cancelToken: cancelToken,
          cache: { expiresIn: Number.POSITIVE_INFINITY },
        })
        .then((blob) => {
          tile.onload = function () {
            URL.revokeObjectURL(tile.src);
            done(null, tile);
          };
          const objectURL = URL.createObjectURL(blob);
          tile.src = objectURL;
        })
        .catch(function (error) {
          if (!isCancelled(error)) {
            console.error('There has been a problem with your fetch operation: ', error.message);
          }
          done(error, null);
        });
    });
    return tile;
  };

  setParams = (params) => {
    this.options = Object.assign(this.options, params);
    const {
      url,
      layers,
      evalscript,
      evalscripturl,
      dataFusion,
      datasetId,
      customSelected,
      minQa,
      upsampling,
      downsampling,
      isWMS,
      baseUrl,
    } = this.options;
    this.layer = this.createLayer(url, {
      datasetId: datasetId,
      evalscript: evalscript,
      evalscripturl: evalscripturl,
      dataFusion: dataFusion,
      layer: layers,
      customSelected: customSelected,
      minQa: minQa,
      upsampling: upsampling,
      downsampling: downsampling,
      isWMS: isWMS,
      baseUrl: baseUrl,
    });

    this.redraw();
  };

  createLayer = async (url, options) => {
    const { isWMS, layer } = options;

    if (isWMS) {
      return new WmsLayer({ baseUrl: url, layerId: layer });
    }
    return await this.createLayerFromService(url, options);
  };

  createLayerFromService = async (url, options) => {
    const {
      layer: layerId,
      datasetId,
      minQa,
      upsampling,
      downsampling,
      customSelected,
      evalscript,
      evalscripturl,
    } = options;
    let layer;
    if (layerId && !customSelected) {
      layer = await LayersFactory.makeLayer(url, layerId);
    } else {
      const allLayers = await LayersFactory.makeLayers(url);
      layer = allLayers.find((vis) => vis.dataset && vis.dataset.id === datasetId);
      layer.layerId = null;
      layer.evalscript = evalscript;
      layer.evalscriptUrl = evalscripturl;
    }
    if (layer.maxCloudCoverPercent !== undefined) {
      layer.maxCloudCoverPercent = 100;
    }
    if (minQa !== undefined) {
      layer.minQa = minQa;
    }
    if (upsampling) {
      layer.upsampling = upsampling;
    }
    if (downsampling) {
      layer.downsampling = downsampling;
    }
    return layer;
  };
}

const createSentinelHubLayer = (props, context) => {
  let instance;
  const { ...params } = props;
  const { leaflet: _l, ...options } = getOptions(params);

  instance = new SentinelHubLayer(options);

  const progress = NProgress.configure({
    parent: instance._container,
    showSpinner: false,
  });

  if (progress) {
    instance.on('loading', function () {
      progress.start();
      progress.inc();
    });

    instance.on('load', function () {
      progress.done();
    });

    instance.on('remove', function () {
      progress.done();
      progress.remove();
    });
  }
  instance.on('tileunload', function (e) {
    e.tile.cancelToken.cancel();
  });
  return { instance, context };
};

const updateSentinelHubLayer = (instance, props, prevProps) => {
  const prevParams = getOptions(prevProps);
  const params = getOptions(props);

  if (!isEqual(params, prevParams)) {
    instance.setParams(params);
  }
  if (prevProps.opacity !== props.opacity) {
    instance.setOpacity(props.opacity);
  }
};

export const getOptions = (params) => {
  let options = {};
  if (params.p) {
    options.position = params.p;
  }
  if (params.url) {
    options.url = params.url;
  }
  if (params.datasetId) {
    options.datasetId = params.datasetId;
  }
  if (params.layers) {
    options.layers = params.layers;
  }
  if (params.fromTime) {
    options.fromTime = params.fromTime;
  } else {
    options.fromTime = null;
  }
  if (params.toTime) {
    options.toTime = params.toTime;
  }
  if (params.tileSize) {
    options.tileSize = params.tileSize;
  }
  if (params.format) {
    options.format = MimeTypes[params.format];
  }
  if (params.customSelected && (params.evalscript || params.evalscripturl)) {
    options.customSelected = true;
    if (params.evalscript) {
      options.evalscript = params.evalscript;
      options.evalscripturl = null;
    }
    if (params.evalscripturl) {
      options.evalscript = null;
      options.evalscripturl = params.evalscripturl;
    }
    if (params.dataFusion) {
      options.dataFusion = params.dataFusion;
    }
  } else {
    options.customSelected = false;
  }

  if (params.minZoom) {
    options.minZoom = params.minZoom;
  }
  if (params.maxZoom && params.allowOverZoomBy) {
    options.maxNativeZoom = params.maxZoom;
    options.maxZoom = params.maxZoom + params.allowOverZoomBy;
  } else if (params.maxZoom) {
    options.maxNativeZoom = params.maxZoom;
    options.maxZoom = params.maxZoom;
  }

  if (params.pane) {
    options.pane = params.pane;
  }

  const effects = {};
  if (params.gainEffect !== undefined) {
    effects.gain = params.gainEffect;
  }
  if (params.gammaEffect !== undefined) {
    effects.gamma = params.gammaEffect;
  }
  if (params.redRangeEffect !== undefined) {
    effects.redRange = { from: params.redRangeEffect[0], to: params.redRangeEffect[1] };
  }
  if (params.greenRangeEffect !== undefined) {
    effects.greenRange = { from: params.greenRangeEffect[0], to: params.greenRangeEffect[1] };
  }
  if (params.blueRangeEffect !== undefined) {
    effects.blueRange = { from: params.blueRangeEffect[0], to: params.blueRangeEffect[1] };
  }
  if (Object.keys(effects).length) {
    options.effects = effects;
  }

  if (params.minQa !== undefined) {
    options.minQa = params.minQa;
  } else {
    options.minQa = null;
  }

  if (params.upsampling) {
    options.upsampling = params.upsampling;
  } else {
    options.upsampling = null;
  }

  if (params.downsampling) {
    options.downsampling = params.downsampling;
  } else {
    options.downsampling = null;
  }

  if (params.showlogo !== undefined) {
    options.showlogo = params.showlogo;
  } else {
    options.showlogo = false;
  }

  if (params.canUseJpeg !== undefined) {
    options.canUseJpeg = params.canUseJpeg;
  } else {
    options.canUseJpeg = false;
  }
  if (params.isWMS !== undefined) {
    options.isWMS = params.isWMS;
  } else {
    options.isWMS = false;
  }

  return options;
};

const SentinelHubLayerComponent = createLayerComponent(createSentinelHubLayer, updateSentinelHubLayer);

export default SentinelHubLayerComponent;
