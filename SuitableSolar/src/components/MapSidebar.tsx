import type { Property } from "../data/Property.interface";

function scoreColor(score: number) {
  if (score >= 95) return '#1a6873';
  if (score >= 90) return '#218085';
  if (score >= 85) return '#32b8c6';
  if (score >= 80) return '#5dc9d4';
  if (score >= 75) return '#a84b2f';
  if (score >= 70) return '#e68161';
  return '#ff5459';
}

interface MapSidebarProps {
  properties: Property[];
  hoveredId: number | null;
  onHover: (id: number | null) => void;
  onSelect: (p: Property) => void;
}

export function MapSidebar({ properties, hoveredId, onHover, onSelect }: MapSidebarProps) {
  const sorted = [...properties].sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return (
    <div className="map-sidebar">
      {/* Legend is rendered in MapPage above the list; keep list here */}
      <div className="map-property-list">
        <h4>All Properties (sorted by score)</h4>
        {sorted.map((p) => (
          <div
            key={p.id}
            className={`map-property-item ${hoveredId === p.id ? "hovered" : ""}`}
            onClick={() => onSelect(p)}
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: "pointer" }}
          >
            <div className="map-property-header">
              <span className="map-property-name">{p.name}</span>
              <span
                className="map-property-score"
                style={{ color: scoreColor(p.suitabilityScore) }}
              >
                {p.suitabilityScore}
              </span>
            </div>
            <span className="map-property-location">{p.location}</span>
            {!p.forSale && (
              <span className="status status--warning" style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
                Not For Sale
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
