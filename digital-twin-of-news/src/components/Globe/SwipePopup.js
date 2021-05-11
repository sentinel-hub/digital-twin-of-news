import React, { useState } from 'react';
import { SWIPE_POPUP_STATUSES } from '../../const';

import './swipe-popup.scss';
export default function SwipePopup({ children, swipePopupStatus, setSwipePopupStatus }) {
  const [startSwipePosition, setStartSwipePosition] = useState(0);

  function onTouchStart(event) {
    const positionY = event.touches[0].clientY;
    setStartSwipePosition(positionY);
  }

  function onTouchMove(event) {
    const currentpositionY = event.touches[0].clientY;
    const direction = getSwipeDirection(startSwipePosition, currentpositionY);
    if (direction === 'up') {
      setStartSwipePosition(currentpositionY);
      setSwipePopupStatus(SWIPE_POPUP_STATUSES.open);
      return;
    }

    if (direction === 'down' && swipePopupStatus !== SWIPE_POPUP_STATUSES.init) {
      setStartSwipePosition(currentpositionY);
      setSwipePopupStatus(SWIPE_POPUP_STATUSES.closed);
    }
  }

  function onTogglePopupClick() {
    if (swipePopupStatus === SWIPE_POPUP_STATUSES.closed || swipePopupStatus === SWIPE_POPUP_STATUSES.init) {
      setSwipePopupStatus(SWIPE_POPUP_STATUSES.open);
    }

    if (swipePopupStatus === SWIPE_POPUP_STATUSES.open) {
      setSwipePopupStatus(SWIPE_POPUP_STATUSES.closed);
    }
  }

  function getSwipeDirection(start, current) {
    const swipeDistance = start - current;
    if (swipeDistance > 30) {
      return 'up';
    }

    if (swipeDistance < -30) {
      return 'down';
    }

    return 'none';
  }

  function getAnimation() {
    if (swipePopupStatus === SWIPE_POPUP_STATUSES.open) {
      return 'slide-in-bottom';
    }
    if (swipePopupStatus === SWIPE_POPUP_STATUSES.closed) {
      return 'slide-out-bottom';
    }

    return '';
  }

  return (
    <>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={(event) => onTouchMove(event)}
        className="swipe-toggle-area-up"
        style={
          swipePopupStatus === SWIPE_POPUP_STATUSES.closed || swipePopupStatus === SWIPE_POPUP_STATUSES.init
            ? { opacity: 1 }
            : { opacity: 0 }
        }
      >
        <i onClick={onTogglePopupClick} className="fas fa-chevron-up"></i>
      </div>
      <div className={`fullscreen-dropdown-content ${getAnimation()}`}>
        <div className="swipe-toggle-area-down" onTouchStart={onTouchStart} onTouchMove={onTouchMove}>
          <i onClick={onTogglePopupClick} className="fas fa-chevron-down toggle-arrow-up"></i>
        </div>
        {children}
      </div>
    </>
  );
}
