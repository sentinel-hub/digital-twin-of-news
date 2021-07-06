import React from 'react';

import LegendFromSpec from './LegendFromSpec';
import LegendFromUrl from './LegendFromUrl';
import { getLegendInfo } from './legendUtils';

export default function Legend(props) {
  const { layerId, eventType } = props;
  const { legend, legendUrl } = getLegendInfo(layerId, eventType);

  if (!legend && !legendUrl) {
    return null;
  }

  return (
    <div className="layer-legend">
      {legend ? (
        <LegendFromSpec legend={legend} />
      ) : legendUrl ? (
        <LegendFromUrl legendUrl={legendUrl} />
      ) : null}
    </div>
  );
}
