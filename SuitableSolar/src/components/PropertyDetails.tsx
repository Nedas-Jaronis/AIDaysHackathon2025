import type { Property } from "../types/Property"
import "../App.css"

import { getSuitabilityColor, getSuitabilityLabel } from "./Suitability"

interface Props {
  property: Property | null
}

export function PropertyDetails({ property }: Props) {
  if (!property) {
    return (
      <div className="empty-state scrollable-panel">
        <h3>Select a Property</h3>
        <p>Click a property to view details.</p>
      </div>
    )
  }

  return (
    <div className="property-details scrollable-panel">
      <h2 className="section-title">Property Details</h2>

      <div className="detail-card">
        <h3>{property.name}</h3>

        {!property.forSale && (
          <span
            className="status status--warning"
            style={{ marginBottom: 'var(--space-12)', display: 'inline-block' }}
          >
            Not Currently For Sale
          </span>
        )}

        <div className="detail-row">
          <span className="detail-label">Location</span>
          <span className="detail-value">{property.location}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Coordinates</span>
          <span className="detail-value">
            {property.coordinates.lat.toFixed(4)}, {property.coordinates.lng.toFixed(4)}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Terrain Type</span>
          <span className="detail-value">{property.terrain}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Zoning</span>
          <span className="detail-value">{property.zoning}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Total Acreage</span>
          <span className="detail-value">{property.acres} acres</span>
        </div>

        {property.owner && (
          <div className="detail-row">
            <span className="detail-label">Current Owner</span>
            <span className="detail-value">{property.owner}</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">
            {property.forSale ? 'Price' : 'Estimated Value'}
          </span>
          <span className="detail-value">
            {property.forSale ? property.price : property.estimatedValue}
          </span>
        </div>
      </div>

      {/* --- SOLAR ANALYSIS PANEL --- */}
      <div className="detail-card">
        <h4>Solar Suitability Analysis</h4>

        <div className="suitability-score">
          <div
            className="score-circle"
            style={{ borderColor: getSuitabilityColor(property.suitabilityScore) }}
          >
            <span className="score-number">{property.suitabilityScore}</span>
            <span className="score-text">{getSuitabilityLabel(property.suitabilityScore)}</span>
          </div>
        </div>

        <div className="criteria-list">
          <div className="criteria-item">
            <div className="criteria-header">
              <span>Slope Analysis</span>
              <span
                className={
                  property.slope <= 5 ? 'status status--success' : 'status status--warning'
                }
              >
                {property.slope <= 5 ? 'Optimal' : 'Acceptable'}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.max(0, 100 - property.slope * 10)}%`,
                  backgroundColor:
                    property.slope <= 5
                      ? 'var(--color-success)'
                      : 'var(--color-warning)',
                }}
              />
            </div>
            <p className="criteria-note">{property.slope}° slope (ideal:  &lt;5°)</p>
          </div>

          <div className="criteria-item">
            <div className="criteria-header">
              <span>Sunlight Exposure</span>
              <span
                className={
                  property.sunlightHours >= 8
                    ? 'status status--success'
                    : 'status status--warning'
                }
              >
                {property.sunlightHours >= 8 ? 'Excellent' : 'Good'}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(property.sunlightHours / 12) * 100}%`,
                  backgroundColor: 'var(--color-success)',
                }}
              />
            </div>
            <p className="criteria-note">{property.sunlightHours} hours daily average</p>
          </div>

          <div className="criteria-item">
            <div className="criteria-header">
              <span>Grid Proximity</span>
              <span
                className={
                  property.gridDistance <= 2
                    ? 'status status--success'
                    : 'status status--warning'
                }
              >
                {property.gridDistance <= 2 ? 'Close' : 'Moderate'}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.max(0, 100 - property.gridDistance * 20)}%`,
                  backgroundColor:
                    property.gridDistance <= 2
                      ? 'var(--color-success)'
                      : 'var(--color-warning)',
                }}
              />
            </div>
            <p className="criteria-note">
              {property.gridDistance} miles to nearest connection
            </p>
          </div>

          <div className="criteria-item">
            <div className="criteria-header">
              <span>Land Size</span>
              <span
                className={
                  property.acres >= 50 ? 'status status--success' : 'status status--info'
                }
              >
                {property.acres >= 50 ? 'Large-scale ready' : 'Community-scale'}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (property.acres / 200) * 100)}%`,
                  backgroundColor: 'var(--color-primary)',
                }}
              />
            </div>
            <p className="criteria-note">
              {property.acres} acres (min. 50 for commercial)
            </p>
          </div>
        </div>

        <div className="action-buttons">
          {property.forSale ? (
            <>
              <button className="btn btn--primary btn--full-width">Request Site Visit</button>
              <button className="btn btn--outline btn--full-width">Download Report</button>
            </>
          ) : (
            <>
              <button className="btn btn--primary btn--full-width">Contact Owner</button>
              <button className="btn btn--outline btn--full-width">Request Valuation</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
