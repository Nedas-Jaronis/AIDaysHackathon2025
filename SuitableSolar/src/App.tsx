import { useState } from 'react'
import './App.css'

interface Property {
  id: number
  name: string
  location: string
  acres: number
  slope: number
  sunlightHours: number
  gridDistance: number
  suitabilityScore: number
  price: string
  coordinates: { lat: number; lng: number }
  terrain: string
  zoning: string
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
    zoning: "Agricultural"
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
    zoning: "Mixed-use"
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
    zoning: "Agricultural"
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
    zoning: "Commercial"
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
    zoning: "Agricultural"
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
    zoning: "Agricultural"
  }
]

function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'acres'>('score')

  const getSuitabilityColor = (score: number) => {
    if (score >= 90) return 'var(--color-success)'
    if (score >= 75) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  const getSuitabilityLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  const sortedProperties = [...mockProperties].sort((a, b) => {
    if (sortBy === 'score') return b.suitabilityScore - a.suitabilityScore
    if (sortBy === 'acres') return b.acres - a.acres
    return 0
  })

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
              <h1>SolarLand</h1>
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
        </div>

        <div className="content-grid">
          <div className="properties-list">
            <h2 className="section-title">Available Properties</h2>
            <div className="property-cards">
              {sortedProperties.map((property) => (
                <div 
                  key={property.id}
                  className={`property-card ${selectedProperty?.id === property.id ? 'selected' : ''}`}
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

                  <div className="property-footer">
                    <div className="price">{property.price}</div>
                    <button className="btn btn--primary btn--sm">View Details</button>
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
                  <div className="detail-row">
                    <span className="detail-label">Price</span>
                    <span className="detail-value">{selectedProperty.price}</span>
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
                    <button className="btn btn--primary btn--full-width">Request Site Visit</button>
                    <button className="btn btn--outline btn--full-width">Download Report</button>
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
      </main>
    </div>
  )
}

export default App
