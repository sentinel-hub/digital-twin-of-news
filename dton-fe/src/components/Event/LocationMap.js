import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

import WorldMap from '../../assets/landTopoJson.json';
import './LocationMap.scss';

function LocationMap(props) {
  const { type, lat, lng } = props;
  return (
    <div className="location-map">
      <div className="line-break top" />
      <ComposableMap viewBox={'-25 -50 920 690'}>
        <Geographies geography={WorldMap}>
          {({ geographies }) =>
            geographies.map((geo) => <Geography className="geography" key={geo.rsmKey} geography={geo} />)
          }
        </Geographies>

        <Marker coordinates={[lng, lat]}>
          <g className={`marker-icon ${type}`} fill="none" strokeWidth="12" transform="translate(0, 0)">
            <circle r="15" />
          </g>
        </Marker>
      </ComposableMap>
      <div className="line-break bottom" />
    </div>
  );
}

export default LocationMap;
