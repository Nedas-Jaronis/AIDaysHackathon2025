import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import type { Property } from "../data/Property.interface"
import "leaflet.heat"

export function HeatmapLayer({ properties }: { properties: Property[] }) {
  const map = useMap()

  useEffect(() => {
    const heatPoints = properties.map(p => [p.coordinates.lat, p.coordinates.lng, p.suitabilityScore / 100]) as [number, number, number][]
    const heatLayer = (L as any).heatLayer(heatPoints, { radius: 50, blur: 35 }).addTo(map)
    return () => { map.removeLayer(heatLayer) }
  }, [map, properties])

  return null
}
