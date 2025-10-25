import { useEffect, useState } from "react"
import type { Property } from "../data/Property.interface"
import { mockProperties } from "../data/mockProperties"

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:5000/locations")
      .then(res => res.json())
      .then(data => {
        const mapped: Property[] = data.items.map((row: any) => ({
          id: row.id,
          name: row.address.split(",")[0],
          location: row.address,
          acres: row.area,
          slope: row.slope,
          sunlightHours: row.solar_day_length,
          gridDistance: row.grid_distance,
          suitabilityScore: row.solar_score,
          coordinates: { lat: row.latitude, lng: row.longitude },
          terrain: "Unknown",
          zoning: "Unknown",
          forSale: true // until backend adds this field
        }))
        setProperties(mapped)
      })
      .catch(() => {
        console.warn("Backend unreachable — using fallback data.")
        setProperties(mockProperties)
      })
      .finally(() => setLoading(false))
  }, [])

  return { properties, loading }
}
