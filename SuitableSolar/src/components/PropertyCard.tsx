import type { Property } from "../types/Property"
import "../App.css"
import { getSuitabilityColor, getSuitabilityLabel } from "./Suitability"


interface Props {
  property: Property
  selected?: boolean
  onSelect: (p: Property) => void
}

export function PropertyCard({ property, selected, onSelect }: Props) {


  return (
<div
  className={`property-card ${selected ? "selected" : ""} ${
    !property.forSale ? "opportunity-card" : ""
  }`}
  onClick={() => onSelect(property)}
>
  {/* Header */}
  <div className="property-header">
    <div>
      <h3 className="section-title--sm">{property.name}</h3>
      <p className="location">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {property.location}
      </p>
    </div>

    <div
      className="score-badge"
      style={{
        backgroundColor: `${getSuitabilityColor(property.suitabilityScore)}20`,
        borderColor: getSuitabilityColor(property.suitabilityScore),
        color: getSuitabilityColor(property.suitabilityScore),
      }}
    >
      <span className="score-value">{property.suitabilityScore}</span>
      <span className="score-label">
        {getSuitabilityLabel(property.suitabilityScore)}
      </span>
    </div>
  </div>

  {/* Metrics */}
  <div className="property-metrics">
    <div className="metric">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
      <span className="metric-label">Size</span>
      <span className="metric-value">{property.acres} acres</span>
    </div>

    <div className="metric">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
      <span className="metric-label">Slope</span>
      <span className="metric-value">{property.slope}°</span>
    </div>

    <div className="metric">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
      </svg>
      <span className="metric-label">Sun</span>
      <span className="metric-value">{property.sunlightHours}h</span>
    </div>

    <div className="metric">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
      <span className="metric-label">Grid</span>
      <span className="metric-value">{property.gridDistance}mi</span>
    </div>
  </div>

  {/* Owner section (only for not-for-sale) */}
  {!property.forSale && property.owner && (
    <div className="owner-section">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span>Owner: {property.owner}</span>
    </div>
  )}

  {/* Footer */}
  <div className="property-footer">
    <div className="price">
      {property.forSale ? property.price : property.estimatedValue}
    </div>
    <button className="btn btn--primary btn--sm">
      {property.forSale ? "View Details" : "Contact Owner"}
    </button>
  </div>
</div>
  )
}
