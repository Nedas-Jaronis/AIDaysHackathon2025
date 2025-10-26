import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import '../App.css'

interface Property {
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

const mockProperties: Property[] = [
  {
    id: 1,
    name: "Sunset Valley Ranch",
    location: "Phoenix, Arizona",
    acres: 150,
    slope: 2,
    sunlightHours: 9.5,
    gridDistance: 1.2,
    suitabilityScore: 95,
    price: "$2,850,000",
    coordinates: { lat: 33.4484, lng: -112.0740 },
    terrain: "Flat grassland",
    zoning: "Agricultural",
    forSale: true
  },
  {
    id: 2,
    name: "Desert Plains Estate",
    location: "Tucson, Arizona",
    acres: 200,
    slope: 1.5,
    sunlightHours: 9.8,
    gridDistance: 0.8,
    suitabilityScore: 98,
    price: "$3,200,000",
    coordinates: { lat: 32.2226, lng: -110.9747 },
    terrain: "Desert flat",
    zoning: "Mixed-use",
    forSale: true
  },
  {
    id: 3,
    name: "Green Meadows Property",
    location: "Sacramento, California",
    acres: 75,
    slope: 4,
    sunlightHours: 8.2,
    gridDistance: 2.1,
    suitabilityScore: 78,
    price: "$1,950,000",
    coordinates: { lat: 38.5816, lng: -121.4944 },
    terrain: "Rolling hills",
    zoning: "Agricultural",
    forSale: true
  },
  {
    id: 4,
    name: "Clearwater Fields",
    location: "Las Vegas, Nevada",
    acres: 180,
    slope: 1,
    sunlightHours: 10.2,
    gridDistance: 0.5,
    suitabilityScore: 99,
    price: "$3,750,000",
    coordinates: { lat: 36.1699, lng: -115.1398 },
    terrain: "Flat desert",
    zoning: "Commercial",
    forSale: true
  },
  {
    id: 5,
    name: "Highland Ridge",
    location: "Albuquerque, New Mexico",
    acres: 120,
    slope: 6,
    sunlightHours: 8.8,
    gridDistance: 3.5,
    suitabilityScore: 68,
    price: "$1,450,000",
    coordinates: { lat: 35.0844, lng: -106.6504 },
    terrain: "Hilly terrain",
    zoning: "Agricultural",
    forSale: true
  },
  {
    id: 6,
    name: "Sunrise Acres",
    location: "El Paso, Texas",
    acres: 225,
    slope: 2.5,
    sunlightHours: 9.1,
    gridDistance: 1.0,
    suitabilityScore: 92,
    price: "$2,675,000",
    coordinates: { lat: 31.7619, lng: -106.4850 },
    terrain: "Flat plains",
    zoning: "Agricultural",
    forSale: true
  },
  // Properties not for sale but suitable
  {
    id: 7,
    name: "Mojave Solar Corridor",
    location: "Barstow, California",
    acres: 320,
    slope: 1.2,
    sunlightHours: 10.5,
    gridDistance: 0.3,
    suitabilityScore: 99,
    estimatedValue: "$5,100,000",
    coordinates: { lat: 34.8958, lng: -117.0228 },
    terrain: "Desert plain",
    zoning: "Unincorporated",
    forSale: false,
    owner: "Private Ranch"
  },
  {
    id: 8,
    name: "Sonoran Flats",
    location: "Yuma, Arizona",
    acres: 285,
    slope: 0.8,
    sunlightHours: 11.0,
    gridDistance: 1.5,
    suitabilityScore: 97,
    estimatedValue: "$4,200,000",
    coordinates: { lat: 32.6927, lng: -114.6277 },
    terrain: "Flat desert",
    zoning: "Agricultural",
    forSale: false,
    owner: "Family Trust"
  },
  {
    id: 9,
    name: "Imperial Valley Site",
    location: "El Centro, California",
    acres: 410,
    slope: 1.0,
    sunlightHours: 10.8,
    gridDistance: 0.6,
    suitabilityScore: 98,
    estimatedValue: "$6,800,000",
    coordinates: { lat: 32.7920, lng: -115.5631 },
    terrain: "Agricultural flatland",
    zoning: "Agricultural",
    forSale: false,
    owner: "Agricultural Co-op"
  },
  {
    id: 10,
    name: "Cochise County Tract",
    location: "Willcox, Arizona",
    acres: 195,
    slope: 2.2,
    sunlightHours: 9.6,
    gridDistance: 1.8,
    suitabilityScore: 94,
    estimatedValue: "$2,900,000",
    coordinates: { lat: 32.2526, lng: -109.8320 },
    terrain: "Desert grassland",
    zoning: "Rural",
    forSale: false,
    owner: "Cattle Ranch LLC"
  },
  {
    id: 11,
    name: "Pecos Valley Land",
    location: "Carlsbad, New Mexico",
    acres: 165,
    slope: 3.5,
    sunlightHours: 9.2,
    gridDistance: 2.3,
    suitabilityScore: 89,
    estimatedValue: "$2,100,000",
    coordinates: { lat: 32.4207, lng: -104.2288 },
    terrain: "Semi-arid plain",
    zoning: "Agricultural",
    forSale: false,
    owner: "Estate Holdings"
  }
]

type ViewMode = 'for-sale' | 'opportunities' | 'map'

// Heat layer component
function HeatmapLayer({ properties }: { properties: Property[] }) {
  const map = useMap()

  useEffect(() => {
    const heatPoints = properties.map(property => [
      property.coordinates.lat,
      property.coordinates.lng,
      property.suitabilityScore / 100
    ]) as [number, number, number][]

    // @ts-ignore
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 50,
      blur: 35,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: '#ff5459',
        0.5: '#e68161',
        0.65: '#a84b2f',
        0.75: '#5dc9d4',
        0.85: '#32b8c6',
        0.9: '#218085',
        1.0: '#1a6873'
      }
    }).addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, properties])

  return null
}

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'acres'>('score')
  const [viewMode, setViewMode] = useState<ViewMode>('for-sale')
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null)

  const getSuitabilityColor = (score: number) => {
    if (score >= 90) return 'var(--color-success)'
    if (score >= 75) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  const getMarkerColor = (score: number) => {
    if (score >= 95) return '#1a6873'
    if (score >= 90) return '#218085'
    if (score >= 85) return '#32b8c6'
    if (score >= 80) return '#5dc9d4'
    if (score >= 75) return '#a84b2f'
    if (score >= 70) return '#e68161'
    return '#ff5459'
  }

  const getSuitabilityLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  const forSaleProperties = mockProperties.filter(p => p.forSale)
  const notForSaleProperties = mockProperties.filter(p => !p.forSale)

  const sortedForSale = [...forSaleProperties].sort((a, b) => {
    if (sortBy === 'score') return b.suitabilityScore - a.suitabilityScore
    if (sortBy === 'acres') return b.acres - a.acres
    return 0
  })

  const sortedNotForSale = [...notForSaleProperties].sort((a, b) => 
    b.suitabilityScore - a.suitabilityScore
  )

  const currentProperties = viewMode === 'for-sale' ? sortedForSale : sortedNotForSale

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <div>
              <h1>SolScope</h1>
              <p className="tagline">Find Perfect Land for Solar Energy</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{mockProperties.length}</span>
              <span className="stat-label">Properties</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{mockProperties.reduce((acc, p) => acc + p.acres, 0)}</span>
              <span className="stat-label">Total Acres</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="view-tabs">
          <button 
            className={`tab-button ${viewMode === 'for-sale' ? 'active' : ''}`}
            onClick={() => setViewMode('for-sale')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            For Sale
          </button>
          <button 
            className={`tab-button ${viewMode === 'opportunities' ? 'active' : ''}`}
            onClick={() => setViewMode('opportunities')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Opportunities
          </button>
          <button 
            className={`tab-button ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            Map View
          </button>
        </div>

        {viewMode !== 'map' ? (
          <>
            <div className="controls">
              <div className="search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by location or property name..."
                  className="form-control"
                />
              </div>
              {viewMode === 'for-sale' && (
                <div className="sort-controls">
                  <label className="form-label">Sort by:</label>
                  <select 
                    className="form-control" 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="score">Suitability Score</option>
                    <option value="acres">Land Size</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              )}
            </div>

            {viewMode === 'opportunities' && (
              <div className="info-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p>These properties are not currently for sale but have exceptional solar potential. Contact owners to explore acquisition opportunities.</p>
              </div>
            )}

            <div className="content-grid">
              <div className="properties-list">
                <h2 className="section-title">
                  {viewMode === 'for-sale' ? 'Available Properties' : 'High-Potential Opportunities'}
                </h2>
                <div className="property-cards">
                  {currentProperties.map((property) => (
                    <div 
                      key={property.id}
                      className={`property-card ${selectedProperty?.id === property.id ? 'selected' : ''} ${!property.forSale ? 'opportunity-card' : ''}`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      <div className="property-header">
                        <div>
                          <h3>{property.name}</h3>
                          <p className="location">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {property.location}
                          </p>
                        </div>
                        <div 
                          className="score-badge"
                          style={{ 
                            backgroundColor: `${getSuitabilityColor(property.suitabilityScore)}20`,
                            borderColor: getSuitabilityColor(property.suitabilityScore),
                            color: getSuitabilityColor(property.suitabilityScore)
                          }}
                        >
                          <span className="score-value">{property.suitabilityScore}</span>
                          <span className="score-label">{getSuitabilityLabel(property.suitabilityScore)}</span>
                        </div>
                      </div>

                      <div className="property-metrics">
                        <div className="metric">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="3" y1="9" x2="21" y2="9"/>
                            <line x1="9" y1="21" x2="9" y2="9"/>
                          </svg>
                          <span className="metric-label">Size</span>
                          <span className="metric-value">{property.acres} acres</span>
                        </div>
                        <div className="metric">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                          </svg>
                          <span className="metric-label">Slope</span>
                          <span className="metric-value">{property.slope}°</span>
                        </div>
                        <div className="metric">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/>
                          </svg>
                          <span className="metric-label">Sun</span>
                          <span className="metric-value">{property.sunlightHours}h</span>
                        </div>
                        <div className="metric">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                          <span className="metric-label">Grid</span>
                          <span className="metric-value">{property.gridDistance}mi</span>
                        </div>
                      </div>

                      {!property.forSale && property.owner && (
                        <div className="owner-section">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span>Owner: {property.owner}</span>
                        </div>
                      )}

                      <div className="property-footer">
                        <div className="price">
                          {property.forSale ? property.price : property.estimatedValue}
                          {!property.forSale && <span className="price-label">Est. Value</span>}
                        </div>
                        <button className="btn btn--primary btn--sm">
                          {property.forSale ? 'View Details' : 'Contact Owner'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="details-panel">
                {selectedProperty ? (
                  <div className="property-details">
                    <h2 className="section-title">Property Details</h2>
                    <div className="detail-card">
                      <h3>{selectedProperty.name}</h3>
                      {!selectedProperty.forSale && (
                        <span className="status status--warning" style={{ marginBottom: 'var(--space-12)', display: 'inline-block' }}>
                          Not Currently For Sale
                        </span>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{selectedProperty.location}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Coordinates</span>
                        <span className="detail-value">
                          {selectedProperty.coordinates.lat.toFixed(4)}, {selectedProperty.coordinates.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Terrain Type</span>
                        <span className="detail-value">{selectedProperty.terrain}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Zoning</span>
                        <span className="detail-value">{selectedProperty.zoning}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Total Acreage</span>
                        <span className="detail-value">{selectedProperty.acres} acres</span>
                      </div>
                      {selectedProperty.owner && (
                        <div className="detail-row">
                          <span className="detail-label">Current Owner</span>
                          <span className="detail-value">{selectedProperty.owner}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">{selectedProperty.forSale ? 'Price' : 'Estimated Value'}</span>
                        <span className="detail-value">{selectedProperty.forSale ? selectedProperty.price : selectedProperty.estimatedValue}</span>
                      </div>
                    </div>

                    <div className="detail-card">
                      <h4>Solar Suitability Analysis</h4>
                      <div className="suitability-score">
                        <div className="score-circle" style={{ borderColor: getSuitabilityColor(selectedProperty.suitabilityScore) }}>
                          <span className="score-number">{selectedProperty.suitabilityScore}</span>
                          <span className="score-text">{getSuitabilityLabel(selectedProperty.suitabilityScore)}</span>
                        </div>
                      </div>
                      
                      <div className="criteria-list">
                        <div className="criteria-item">
                          <div className="criteria-header">
                            <span>Slope Analysis</span>
                            <span className={selectedProperty.slope <= 5 ? 'status status--success' : 'status status--warning'}>
                              {selectedProperty.slope <= 5 ? 'Optimal' : 'Acceptable'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.max(0, 100 - (selectedProperty.slope * 10))}%`,
                                backgroundColor: selectedProperty.slope <= 5 ? 'var(--color-success)' : 'var(--color-warning)'
                              }}
                            />
                          </div>
                          <p className="criteria-note">
                            {selectedProperty.slope}° slope (ideal: &lt;5°)
                          </p>
                        </div>

                        <div className="criteria-item">
                          <div className="criteria-header">
                            <span>Sunlight Exposure</span>
                            <span className={selectedProperty.sunlightHours >= 8 ? 'status status--success' : 'status status--warning'}>
                              {selectedProperty.sunlightHours >= 8 ? 'Excellent' : 'Good'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${(selectedProperty.sunlightHours / 12) * 100}%`,
                                backgroundColor: 'var(--color-success)'
                              }}
                            />
                          </div>
                          <p className="criteria-note">
                            {selectedProperty.sunlightHours} hours daily average
                          </p>
                        </div>

                        <div className="criteria-item">
                          <div className="criteria-header">
                            <span>Grid Proximity</span>
                            <span className={selectedProperty.gridDistance <= 2 ? 'status status--success' : 'status status--warning'}>
                              {selectedProperty.gridDistance <= 2 ? 'Close' : 'Moderate'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.max(0, 100 - (selectedProperty.gridDistance * 20))}%`,
                                backgroundColor: selectedProperty.gridDistance <= 2 ? 'var(--color-success)' : 'var(--color-warning)'
                              }}
                            />
                          </div>
                          <p className="criteria-note">
                            {selectedProperty.gridDistance} miles to nearest connection
                          </p>
                        </div>

                        <div className="criteria-item">
                          <div className="criteria-header">
                            <span>Land Size</span>
                            <span className={selectedProperty.acres >= 50 ? 'status status--success' : 'status status--info'}>
                              {selectedProperty.acres >= 50 ? 'Large-scale ready' : 'Community-scale'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.min(100, (selectedProperty.acres / 200) * 100)}%`,
                                backgroundColor: 'var(--color-primary)'
                              }}
                            />
                          </div>
                          <p className="criteria-note">
                            {selectedProperty.acres} acres (min. 50 for commercial)
                          </p>
                        </div>
                      </div>

                      <div className="action-buttons">
                        {selectedProperty.forSale ? (
                          <>
                            <button className="btn btn--primary btn--full-width">Request Site Visit</button>
                            <button className="btn btn--outline btn--full-width">Download Report</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn--primary btn--full-width">Contact Owner</button>
                            <button className="btn btn--outline btn--full-width">Request Valuation</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <h3>Select a Property</h3>
                    <p>Click on any property card to view detailed solar suitability analysis</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="map-view">
            <div className="map-container">
              <MapContainer
                center={[35.5, -110.0]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <HeatmapLayer properties={mockProperties} />

                {mockProperties.map((property) => (
                  <CircleMarker
                    key={property.id}
                    center={[property.coordinates.lat, property.coordinates.lng]}
                    radius={hoveredProperty === property.id ? 12 : 8}
                    fillColor={getMarkerColor(property.suitabilityScore)}
                    fillOpacity={0.9}
                    color="#fff"
                    weight={2}
                    eventHandlers={{
                      mouseover: () => setHoveredProperty(property.id),
                      mouseout: () => setHoveredProperty(null),
                      click: () => setSelectedProperty(property)
                    }}
                  >
                    <Popup>
                      <div className="map-popup">
                        <h4>{property.name}</h4>
                        <p className="popup-location">{property.location}</p>
                        <div className="popup-score" style={{ color: getSuitabilityColor(property.suitabilityScore) }}>
                          Score: {property.suitabilityScore}
                        </div>
                        <div className="popup-details">
                          <span>{property.acres} acres</span>
                          <span>{property.sunlightHours}h sun</span>
                        </div>
                        <div className="popup-price">{property.forSale ? property.price : property.estimatedValue}</div>
                        {!property.forSale && (
                          <span className="status status--warning" style={{ marginTop: 'var(--space-8)', display: 'inline-block' }}>Not For Sale</span>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            <div className="map-sidebar">
              <div className="map-legend">
                <h3>Solar Suitability Heat Map</h3>
                <p className="legend-description">
                  Visualizing land solar potential across the southwestern United States
                </p>
                
                <div className="legend-scale">
                  <h4>Suitability Score</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#1a6873' }}></div>
                      <span>95-100: Exceptional</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#32b8c6' }}></div>
                      <span>85-94: Excellent</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#5dc9d4' }}></div>
                      <span>80-84: Very Good</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#a84b2f' }}></div>
                      <span>75-79: Good</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#e68161' }}></div>
                      <span>70-74: Fair</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#ff5459' }}></div>
                      <span>&lt;70: Poor</span>
                    </div>
                  </div>
                </div>

                <div className="map-instructions">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <p>Hover over markers to highlight. Click markers to view full property details.</p>
                </div>
              </div>

              <div className="map-property-list">
                <h4>Top Properties</h4>
                {[...mockProperties].sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 3).map((property) => (
                  <div 
                    key={property.id}
                    className="map-property-item"
                    onClick={() => setSelectedProperty(property)}
                    onMouseEnter={() => setHoveredProperty(property.id)}
                    onMouseLeave={() => setHoveredProperty(null)}
                  >
                    <div className="map-property-header">
                      <span className="map-property-name">{property.name}</span>
                      <span 
                        className="map-property-score"
                        style={{ color: getSuitabilityColor(property.suitabilityScore) }}
                      >
                        {property.suitabilityScore}
                      </span>
                    </div>
                    <span className="map-property-location">{property.location}</span>
                    {!property.forSale && (
                      <span className="status status--warning" style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
                        Not For Sale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
