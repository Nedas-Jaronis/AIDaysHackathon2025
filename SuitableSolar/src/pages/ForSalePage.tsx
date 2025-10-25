import { useState } from "react"
import { useProperties } from "../hooks/useProperties"
import type { Property } from "../types/Property"
import { PropertyCard } from "../components/PropertyCard"
import { PropertyDetails } from "../components/PropertyDetails"

export function ForSalePage() {
  const { properties, loading } = useProperties()
  const [selected, setSelected] = useState<Property | null>(null)

  if (loading) return <div className="loading">Loading...</div>

  // HYBRID: default missing forSale to true for backend-derived rows
  const forSale = properties.filter(p => p.forSale !== false)

  return (
    <>
      <div className="controls">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by location or property name..."
            className="form-control"
            // (wire to backend later if needed)
          />
        </div>
        <div className="sort-controls">
          <label className="form-label">Sort by:</label>
          <select
            className="form-control"
            // (wire to state later if needed)
            defaultValue="score"
          >
            <option value="score">Suitability Score</option>
            <option value="acres">Land Size</option>
          </select>
        </div>
      </div>

      <div className="content-grid">
        <div className="properties-list">
          <h2 className="section-title">Available Properties</h2>
          <div className="property-cards">
            {[...forSale]
              .sort((a, b) => (b.suitabilityScore - a.suitabilityScore))
              .map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  selected={selected?.id === p.id}
                  onSelect={setSelected}
                />
              ))}
          </div>
        </div>

        <div className="details-panel">
          <PropertyDetails property={selected} />
        </div>
      </div>
    </>
  )
}
