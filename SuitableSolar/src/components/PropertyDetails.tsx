import type { Property } from "../types/Property"

interface Props {
  property: Property | null
}

export function PropertyDetails({ property }: Props) {
  if (!property) {
    return (
      <div className="empty-state">
        <h3>Select a Property</h3>
        <p>Click a property to view details.</p>
      </div>
    )
  }

  return (
    <div className="property-details">
      <h2>{property.name}</h2>
      <p><strong>Location:</strong> {property.location}</p>
      <p><strong>Coordinates:</strong> {property.coordinates.lat.toFixed(4)}, {property.coordinates.lng.toFixed(4)}</p>
      <p><strong>Acreage:</strong> {property.acres} acres</p>
      <p><strong>Score:</strong> {property.suitabilityScore}</p>

      {property.owner && <p><strong>Owner:</strong> {property.owner}</p>}

      <p><strong>{property.forSale ? "Price:" : "Est. Value:"}</strong> {property.forSale ? property.price : property.estimatedValue}</p>
    </div>
  )
}
