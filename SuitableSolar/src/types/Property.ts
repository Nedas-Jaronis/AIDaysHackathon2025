export interface Property {
    id: number
    // HYBRID core (from backend)
    name: string              // derived from address prefix (e.g., "123 Main St")
    location: string          // full address (e.g., "123 Main St, Gainesville, FL")
    acres: number             // from DB "area" (use as-is or convert upstream)
    slope: number
    sunlightHours: number     // from DB "solar_day_length"
    gridDistance: number
    suitabilityScore: number  // from DB "solar_score"
    coordinates: { lat: number; lng: number }
  
    // HYBRID presentation (mock/fallback until DB adds them)
    terrain?: string
    zoning?: string
    forSale?: boolean
    price?: string
    owner?: string
    estimatedValue?: string
  }
  