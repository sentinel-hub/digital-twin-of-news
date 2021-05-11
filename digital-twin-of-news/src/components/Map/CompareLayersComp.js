import React, { useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useHistory } from 'react-router-dom';

import CompareLayersDateChanger from './CompareLayersDateChanger';

import './CompareLayersComp.scss';

const DRAG_HANDLER_WIDTH = 48;
const INITIAL_SLIDER_POSTION = 0.5;

const getDividerPostition = (sliderPostition, map) => {
  if (!map || !sliderPostition) {
    return;
  }
  const offset = (INITIAL_SLIDER_POSTION - sliderPostition) * DRAG_HANDLER_WIDTH;
  return map.getSize().x * sliderPostition + offset;
};

const clip = (dividerPostition, leftRef, rightRef, map) => {
  if (!leftRef || !rightRef) {
    return;
  }
  if (leftRef.current && rightRef.current) {
    const leftContainer = leftRef.current.getContainer();
    const rightContainer = rightRef.current.getContainer();
    if (leftContainer && rightContainer) {
      const nw = map.containerPointToLayerPoint([0, 0]);
      const se = map.containerPointToLayerPoint(map.getSize());
      const clipX = nw.x + dividerPostition;
      const clipLeft = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)';
      const clipRight = 'rect(' + [nw.y, se.x, se.y, clipX].join('px,') + 'px)';
      leftContainer.style.clip = clipLeft;
      rightContainer.style.clip = clipRight;
    }
  }
};

function CompareLayersComp({ dates, getAndSetPrevNextDate, equalDates, isSingleDateLayer, children }) {
  const map = useMap();
  const history = useHistory();
  const [sliderPostition, setSliderPosition] = useState(INITIAL_SLIDER_POSTION);
  const [dividerPostition, setDividerPosition] = useState(getDividerPostition(INITIAL_SLIDER_POSTION, map));

  const leftLayer = children[0].ref;
  const rightLayer = children[1].ref;

  useMapEvents({
    move(e) {
      clip(dividerPostition, leftLayer, rightLayer, map);
    },
    resize(e) {
      setDividerPosition(getDividerPostition(sliderPostition, map));
    },
  });

  useEffect(() => {
    // if using singleDateLayer, only render event on right container with no clipping
    if (isSingleDateLayer) {
      cleanContainer(rightLayer);
    }
  }, [leftLayer, rightLayer, isSingleDateLayer]);

  useEffect(() => {
    map.invalidateSize();
  }, [history.location.pathname, map]);

  useEffect(() => {
    clip(dividerPostition, leftLayer, rightLayer, map);
  }, [dividerPostition, leftLayer, map, rightLayer]);

  function cleanContainer(ref) {
    if (ref && ref.current) {
      ref.current.getContainer().style.clip = '';
    }
  }

  function onDragStartHandler() {
    map.dragging.disable();
  }

  function onDragEndHandler() {
    map.dragging.enable();
  }

  function onChangeHandler(evt) {
    setSliderPosition(evt.target.value);
    setDividerPosition(getDividerPostition(evt.target.value, map));
  }
  return (
    <>
      <div className="compare-slider">
        {!isSingleDateLayer && (
          <CompareLayersDateChanger
            date={dates[0]}
            position="left"
            getAndSetPrevNextDate={getAndSetPrevNextDate}
          />
        )}

        <CompareLayersDateChanger
          date={dates[1]}
          position="right"
          getAndSetPrevNextDate={getAndSetPrevNextDate}
        />

        {!equalDates && !isSingleDateLayer && (
          <>
            <div
              className="compare-slider-divider"
              style={sliderPostition * 100 > 100 ? { left: '100%' } : { left: dividerPostition + 'px' }}
            />
            <input
              className={'compare-slider-range'}
              type="range"
              value={sliderPostition}
              onChange={onChangeHandler}
              step="0.01"
              min="0"
              max="1"
              onMouseUp={onDragEndHandler}
              onMouseDown={onDragStartHandler}
              onTouchEnd={onDragEndHandler}
              onTouchStart={onDragStartHandler}
            />
          </>
        )}
      </div>
      {children}
    </>
  );
}

export default CompareLayersComp;
