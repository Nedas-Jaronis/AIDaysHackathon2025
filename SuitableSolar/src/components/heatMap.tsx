import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import usStatesGeoJsonRaw from "../data/us-states.json";
import type { GeoJsonObject } from "geojson";

const usStatesGeoJson = usStatesGeoJsonRaw as GeoJsonObject;

type Props = {
  selectedYear: number;
};

type StateData = Record<string, number>;

const COLOR_SCALE = [
  { threshold: 80, color: "#00441b" },
  { threshold: 60, color: "#006d2c" },
  { threshold: 40, color: "#238b45" },
  { threshold: 20, color: "#41ab5d" },
  { threshold: 10, color: "#74c476" },
  { threshold: 0, color: "#bae4b3" }
];

const getColor = (percent: number): string => {
  for (const { threshold, color } of COLOR_SCALE) {
    if (percent > threshold) return color;
  }
  return COLOR_SCALE[COLOR_SCALE.length - 1].color;
};

const isValidState = (stateAbbr: string | undefined): boolean => {
  return !!stateAbbr && stateAbbr.length === 2 && stateAbbr !== "US";
};

function StateHeatLayer({ dataMap }: { dataMap: StateData | null }) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!map || !dataMap) return;

    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }

    // Create GeoJSON layer with styling
    const geoJsonLayer = L.geoJSON(usStatesGeoJson as any, {
      style: (feature) => {
        const stateAbbr = feature?.id as string;
        
        if (!isValidState(stateAbbr)) {
          return { fillOpacity: 0, weight: 0, opacity: 0 };
        }

        const value = dataMap[stateAbbr] ?? 0;
        
        return {
          fillColor: getColor(value),
          fillOpacity: 0.7,
          color: "#ffffff",
          weight: 2,
          opacity: 1
        };
      },
      onEachFeature: (feature, layer) => {
        const stateAbbr = feature?.id as string;
        
        if (!isValidState(stateAbbr)) return;

        const value = dataMap[stateAbbr] ?? 0;
        const stateName = feature?.properties?.name || stateAbbr;
        const fillColor = getColor(value);

        layer.bindPopup(`
          <div style="text-align: center; padding: 5px;">
            <strong style="font-size: 16px;">${stateName}</strong><br/>
            <span style="font-size: 18px; color: ${fillColor}; font-weight: bold;">
              ${value.toFixed(2)}%
            </span>
          </div>
        `);

        layer.on({
          mouseover: (e) => {
            e.target.setStyle({
              weight: 4,
              color: "#333",
              fillOpacity: 0.9
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              e.target.bringToFront();
            }
          },
          mouseout: (e) => {
            geoJsonLayer.resetStyle(e.target);
          },
          click: () => {
            map.fitBounds((layer as any).getBounds());
          }
        });
      }
    });

    geoJsonLayer.addTo(map);
    layerRef.current = geoJsonLayer;

    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
      }
    };
  }, [map, dataMap]);

  return null;
}

const ForecastHeatmaps: React.FC<Props> = ({ selectedYear }) => {
  const [renewableData, setRenewableData] = useState<StateData | null>(null);
  const [nonRenewableData, setNonRenewableData] = useState<StateData | null>(null);
  const [showRenewable, setShowRenewable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [renResponse, nonResponse] = await Promise.all([
          fetch(`/heatmap_percent_renewable_${selectedYear}.json`),
          fetch(`/heatmap_percent_nonrenewable_${selectedYear}.json`)
        ]);
        
        if (!renResponse.ok || !nonResponse.ok) {
          throw new Error(`Data files not found for year ${selectedYear}`);
        }
        
        const renData = await renResponse.json();
        const nonData = await nonResponse.json();
        
        delete renData["US"];
        delete nonData["US"];
        
        setRenewableData(renData);
        setNonRenewableData(nonData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedYear]);

  const currentData = showRenewable ? renewableData : nonRenewableData;
  const currentType = showRenewable ? "Renewable" : "Non-Renewable";

  return (
    <>
      <div style={{ 
        position: "absolute", 
        bottom: "20px", 
        left: "10px", 
        zIndex: 1000,
        backgroundColor: "white",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        minWidth: "200px"
      }}>
        <div style={{ 
          fontSize: "13px", 
          fontWeight: "600", 
          color: "#666",
          marginBottom: "10px"
        }}>
          Energy Type
        </div>
        <button 
          onClick={() => setShowRenewable(!showRenewable)}
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: showRenewable ? "#059669" : "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "all 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = showRenewable ? "#047857" : "#b91c1c";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = showRenewable ? "#059669" : "#dc2626";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          }}
        >
          {currentType} ({selectedYear})
        </button>
        
      </div>
      {loading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          backgroundColor: "white",
          padding: "20px 40px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontSize: "16px",
          fontWeight: "600"
        }}>
          Loading heatmap data...
        </div>
      )}
      {error && (
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1001,
          backgroundColor: "#fee",
          color: "#c00",
          padding: "12px 20px",
          borderRadius: "6px",
          border: "1px solid #fcc",
          fontSize: "14px",
          maxWidth: "400px"
        }}>
          Error: {error}
        </div>
      )}
      <MapContainer
        center={[37.8, -96]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {!loading && currentData && (
          <StateHeatLayer 
            key={`${currentType}-${selectedYear}`}
            dataMap={currentData} 
          />
        )}
      </MapContainer>

      {/* Legend */}
      {!loading && currentData && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          right: "10px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          fontSize: "13px",
          minWidth: "150px"
        }}>
          <div style={{ fontWeight: "700", marginBottom: "6px", fontSize: "14px", color: "#333" }}>
            {currentType} Energy
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px", lineHeight: "1.4" }}>
            Darker = Higher %
          </div>
          {[
            { label: "> 80%", color: "#00441b", desc: "Very High" },
            { label: "60-80%", color: "#006d2c", desc: "High" },
            { label: "40-60%", color: "#238b45", desc: "Moderate" },
            { label: "20-40%", color: "#41ab5d", desc: "Low-Moderate" },
            { label: "10-20%", color: "#74c476", desc: "Low" },
            { label: "< 10%", color: "#bae4b3", desc: "Very Low" }
          ].map(({ label, color, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", marginBottom: "6px", gap: "8px" }}>
              <div style={{
                width: "30px",
                height: "18px",
                backgroundColor: color,
                border: "1px solid #ccc",
                borderRadius: "2px",
                flexShrink: 0
              }} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
                <span style={{ fontWeight: "600", fontSize: "12px" }}>{label}</span>
                <span style={{ fontSize: "11px", color: "#666" }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ForecastHeatmaps;