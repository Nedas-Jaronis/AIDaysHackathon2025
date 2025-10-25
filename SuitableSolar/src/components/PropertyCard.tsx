import type { Property } from "../types/Property"
import "../App.css"

interface Props {
  property: Property
  selected?: boolean
  onSelect: (p: Property) => void
}

export function PropertyCard({ property, selected, onSelect }: Props) {
  return (
    <div
      className={`property-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(property)}
    >
      <div className="property-header">
        <div>
          <h3 className="section-title--sm">{property.name}</h3>
          <p className="location text-muted">{property.location}</p>
        </div>
        <div className="score-badge">
          <span className="score-value">{property.suitabilityScore}</span>
        </div>
      </div>

      <div className="property-metrics">
        <div className="metric">
          <span className="metric-label text-muted">Size</span>
          <span className="metric-value">{property.acres} acres</span>
        </div>
        <div className="metric">
          <span className="metric-label text-muted">Sun</span>
          <span className="metric-value">{property.sunlightHours}h</span>
        </div>
      </div>

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
