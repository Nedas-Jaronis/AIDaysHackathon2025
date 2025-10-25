export interface Property {
    id: number
    name: string
    location: string
    acres: number
    slope: number
    sunlightHours: number
    gridDistance: number
    suitabilityScore: number
    price?: string
    coordinates: { lat: number; lng: number }
    terrain: string
    zoning: string
    forSale: boolean
    owner?: string
    estimatedValue?: string
  }