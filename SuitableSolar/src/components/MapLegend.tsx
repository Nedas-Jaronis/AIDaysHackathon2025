export function MapLegend() {
    return (
      <div className="map-legend">
        <h3>Solar Suitability Heat Map</h3>
        <p className="legend-description">
          Visualizing land solar potential across the southwestern United States
        </p>
  
        <div className="legend-scale">
          <h4>Suitability Score</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#1a6873' }} />
              <span>95–100: Exceptional</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#32b8c6' }} />
              <span>85–94: Excellent</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#5dc9d4' }} />
              <span>80–84: Very Good</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#a84b2f' }} />
              <span>75–79: Good</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#e68161' }} />
              <span>70–74: Fair</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ff5459' }} />
              <span>&lt;70: Poor</span>
            </div>
          </div>
        </div>
  
        <div className="map-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>Hover over markers to highlight. Click markers to view full property details.</p>
        </div>
      </div>
    );
  }
  