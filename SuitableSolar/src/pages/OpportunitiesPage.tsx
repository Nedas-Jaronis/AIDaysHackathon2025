import { useState } from "react"
import { useProperties } from "../hooks/useProperties"
import type { Property } from "../types/Property"
import { PropertyCard } from "../components/PropertyCard"
import { PropertyDetails } from "../components/PropertyDetails"

export function OpportunitiesPage() {
  const { properties, loading } = useProperties()
  const [selected, setSelected] = useState<Property | null>(null)

  if (loading) return <div className="loading">Loading...</div>

  // HYBRID: opportunities = explicit forSale === false (mock fills this for fallback set)
  const opportunities = properties.filter(p => p.forSale === false)

  return (
    <>
      <div className="info-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p>These properties are not currently for sale but have exceptional solar potential. Contact owners to explore acquisition opportunities.</p>
      </div>

      <div className="content-grid">
        <div className="properties-list">
          <h2 className="section-title">High-Potential Opportunities</h2>
          <div className="property-cards">
            {[...opportunities]
              .sort((a, b) => (b.suitabilityScore - a.suitabilityScore))
              .map((p) => (
                <div key={p.id} className="opportunity-card">
                  <PropertyCard
                    property={p}
                    selected={selected?.id === p.id}
                    onSelect={setSelected}
                  />
                </div>
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
