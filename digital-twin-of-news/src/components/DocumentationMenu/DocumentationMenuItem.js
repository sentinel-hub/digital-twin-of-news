import React from 'react';

export default function PopupMenuNavbarItem({ title, onClick, selected }) {
  return (
    <button
      className={selected ? 'popup-menu-navbar-item popup-menu-navbar-item-active' : 'popup-menu-navbar-item'}
      onClick={onClick}
    >
      {title}
    </button>
  );
}
