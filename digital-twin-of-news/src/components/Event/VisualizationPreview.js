import React, { useState } from 'react';

export default function VisualizationPreview({
  layerId,
  title,
  onLayerClick,
  isSelected,
  image,
  information,
}) {
  const [isExpanded, setisExpanded] = useState(false);

  function toggleCollapsible(event) {
    event.stopPropagation();
    setisExpanded((prevCollapse) => !prevCollapse);
  }

  return (
    <div className="visualization-preview-wrap">
      <div
        className={`visualization-preview ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          onLayerClick(layerId);
        }}
      >
        <img src={image} alt="" />
        <div className="preview-name">
          <div className="text">{title}</div>
        </div>
        {information && (
          <button className="visualization-preview-info-button" onClick={toggleCollapsible}>
            <i className="fas fa-info-circle"></i>
          </button>
        )}
      </div>
      {isExpanded && (
        <div className={`visualization-preview-collapsible`}>
          <button onClick={toggleCollapsible} className="visualization-preview-collapsible-close-button">
            <i className="fas fa-times"></i>
          </button>
          <div className="visualization-preview-collapsible-section">
            <div className="visualization-preview-collapsible-title">General Description</div>
            <div className="visualization-preview-collapsible-text">{information.text}</div>
          </div>
          <div className="visualization-preview-collapsible-section">
            <div className="visualization-preview-collapsible-title">Useful Links</div>
            {information.links.length > 0 ? (
              information.links.map(({ href, description }) => (
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  className="visualization-preview-collapsible-text"
                  href={href}
                >
                  {description}
                </a>
              ))
            ) : (
              <div className="visualization-preview-collapsible-text">No links available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
