import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useMemo, useState } from "react";
import { useProperties } from "../hooks/useProperties";
import type { Property } from "../types/Property";
import { HeatmapLayer } from "../components/HeatmapLayer.tsx";
import { MapLegend } from "../components/MapLegend";
import { MapSidebar } from "../components/MapSidebar";
import { PropertyDetails } from "../components/PropertyDetails";

function markerColor(score: number) {
  if (score >= 95) return '#1a6873';
  if (score >= 90) return '#218085';
  if (score >= 85) return '#32b8c6';
  if (score >= 80) return '#5dc9d4';
  if (score >= 75) return '#a84b2f';
  if (score >= 70) return '#e68161';
  return '#ff5459';
}

export function MapPage() {
  const { properties, loading } = useProperties();
  const [selected, setSelected] = useState<Property | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const center = useMemo<[number, number]>(() => [35.5, -110.0], []);
  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="map-view">
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heat layer */}
          <HeatmapLayer properties={properties} />

          {/* Markers */}
          {properties.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.coordinates.lat, p.coordinates.lng]}
              radius={hoveredId === p.id ? 12 : 8}
              fillColor={markerColor(p.suitabilityScore)}
              fillOpacity={0.9}
              color="#fff"
              weight={2}
              eventHandlers={{
                mouseover: () => setHoveredId(p.id),
                mouseout: () => setHoveredId(null),
                click: () => setSelected(p),
              }}
            >
              <Popup>
                <div className="map-popup">
                  <h4>{p.name}</h4>
                  <p className="popup-location">{p.location /* full address */}</p>
                  <div className="popup-score" style={{ color: markerColor(p.suitabilityScore) }}>
                    Score: {p.suitabilityScore}
                  </div>
                  <div className="popup-details">
                    <span>{p.acres} acres</span>
                    <span>{p.sunlightHours}h sun</span>
                  </div>
                  <div className="popup-price">{p.forSale ? p.price : p.estimatedValue}</div>
                  {p.forSale === false && (
                    <span className="status status--warning" style={{ marginTop: 'var(--space-8)', display: 'inline-block' }}>
                      Not For Sale
                    </span>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar (legend + full, sorted list) */}
      <div className="map-sidebar">
        <MapLegend />
        <MapSidebar
          properties={properties}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={setSelected}
        />
      </div>

      {/* Right details */}
      <div className="details-panel">
        <PropertyDetails property={selected} />
      </div>
    </div>
  );
}
