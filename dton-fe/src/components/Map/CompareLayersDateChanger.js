import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

function CompareLayersDateChanger({ position, date, getAndSetPrevNextDate }) {
  const dateLabelRef = useRef(null);
  const [prevDateDisabled, setPrevDateDisabled] = useState(false);
  const [nextDateDisabled, setNextDateDisabled] = useState(false);

  useEffect(() => {
    L.DomEvent.disableScrollPropagation(dateLabelRef.current);
    L.DomEvent.disableClickPropagation(dateLabelRef.current);
  });

  useEffect(() => {
    setPrevDateDisabled(false);
    setNextDateDisabled(false);
  }, [date]);

  async function getPrevDate() {
    if (prevDateDisabled) {
      return;
    }
    await getAndSetPrevNextDate(date, position, 'prev').catch((err) => setPrevDateDisabled(true));
  }

  async function getNextDate() {
    if (nextDateDisabled) {
      return;
    }
    await getAndSetPrevNextDate(date, position, 'next').catch((err) => setNextDateDisabled(true));
  }

  return (
    <div className={`label ${position}`} ref={dateLabelRef}>
      <span className={`date prev-btn ${prevDateDisabled ? 'disabled' : ''}`} onClick={getPrevDate}>
        <i className={`fa fa-caret-left cal-icon-left`} />
      </span>

      <span className="date">{date.format('YYYY-MM-DD')}</span>

      <span className={`date prev-btn ${nextDateDisabled ? 'disabled' : ''}`} onClick={getNextDate}>
        <i className={`fa fa-caret-right cal-icon-right`} />
      </span>
    </div>
  );
}

export default CompareLayersDateChanger;
