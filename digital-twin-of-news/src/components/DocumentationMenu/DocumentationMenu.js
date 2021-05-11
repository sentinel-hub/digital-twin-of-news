import React, { useEffect, useState } from 'react';
import DocumentationMenuItem from './DocumentationMenuItem';

import ReactMarkdown from 'react-markdown';

import './documentation-menu.scss';

export default function PopupMenu({ onOutsideClick, items, onCloseClick }) {
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [selectedMenuItemText, setSelectedMenuItemText] = useState('');

  function handleOnNavItemClick(itemId) {
    setSelectedMenuItem(itemId);
  }

  useEffect(() => {
    function getSelectedMenuItemText() {
      fetch(items[selectedMenuItem].text)
        .then((res) => res.text())
        .then((text) => setSelectedMenuItemText(text));
    }
    getSelectedMenuItemText();
  }, [selectedMenuItem, items]);

  return (
    <div onClick={onOutsideClick} className="popup-menu-wrap">
      <div onClick={(event) => event.stopPropagation()} className="popup-menu">
        <div>
          <i onClick={onCloseClick} className="fas fa-times icon-close"></i>
        </div>
        <div className="popup-menu-navbar">
          {items.map(({ title }, index) => (
            <DocumentationMenuItem
              key={index}
              selected={index === selectedMenuItem}
              onClick={() => handleOnNavItemClick(index)}
              title={title}
            />
          ))}
        </div>
        <div className="popup-menu-content">
          <ReactMarkdown>{selectedMenuItemText}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
