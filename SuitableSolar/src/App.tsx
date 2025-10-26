import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import './App.css'

export interface Property {
  id: number
  name?: string
  location?: string
  acres: number
  slope?: number
  sunlightHours?: number
  gridDistance?: number
  suitabilityScore: number
  price: string
  estimatedValue?: string
  coordinates: { lat: number; lng: number }
  terrain?: string
  zoning?: string
  forSale: boolean
  owner?: string
  ghi_jan?: number;
  ghi_feb?: number;
  ghi_mar?: number;
  ghi_apr?: number;
  ghi_may?: number;
  ghi_jun?: number;
  ghi_jul?: number;
  ghi_aug?: number;
  ghi_sep?: number;
  ghi_oct?: number;
  ghi_nov?: number;
  ghi_dec?: number;
}

type ViewMode = 'for-sale' | 'opportunities' | 'map'


function HeatmapLayer({ properties }: { properties: Property[] }) {
  const map = useMap()

  useEffect(() => {
    const heatPoints = properties.map(property => [
      property.coordinates.lat,
      property.coordinates.lng,
      property.suitabilityScore / 100,
    ]) as [number, number, number][]

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
        1.0: '#1a6873',
      },
    }).addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, properties])

  return null
}

function App() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'acres'>('score')
  const [viewMode, setViewMode] = useState<ViewMode>('for-sale')
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMonthlySunlight, setShowMonthlySunlight] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  





useEffect(() => {
  fetch('http://localhost:8000/properties')
    .then(res => res.json())
    .then((data: any[]) => {
      const mapped = data.map(p => ({
        id: p.id,
        name: p.address,
        location: p.address,
        acres: p.acres ?? 0,
        slope: p.tilt_deg !== undefined ? Number(p.tilt_deg.toFixed(2)) : 0,
        sunlightHours: p.annual_ghi !== undefined? Number(p.annual_ghi.toFixed(2)): 0,
        gridDistance: p.nearest_substation_km !== undefined ? Number(p.nearest_substation_km.toFixed(2)) : 0,
        suitabilityScore: Math.ceil(p.solar_score ?? 0),
        price: p.price ? `$${Number(p.price).toLocaleString()}` : 'N/A',
        forSale: p.for_sale ?? true,
        estimatedValue: p.estimated_value ? `$${Number(p.estimated_value).toLocaleString()}` : undefined,
        owner: p.owner,
        coordinates: { lat: p.latitude, lng: p.longitude },
        ghi_jan: p.ghi_jan !== undefined ? Number(p.ghi_jan.toFixed(2)) : undefined,
        ghi_feb: p.ghi_feb !== undefined ? Number(p.ghi_feb.toFixed(2)) : undefined,
        ghi_mar: p.ghi_mar !== undefined ? Number(p.ghi_mar.toFixed(2)) : undefined,
        ghi_apr: p.ghi_apr !== undefined ? Number(p.ghi_apr.toFixed(2)) : undefined,
        ghi_may: p.ghi_may !== undefined ? Number(p.ghi_may.toFixed(2)) : undefined,
        ghi_jun: p.ghi_jun !== undefined ? Number(p.ghi_jun.toFixed(2)) : undefined,
        ghi_jul: p.ghi_jul !== undefined ? Number(p.ghi_jul.toFixed(2)) : undefined,
        ghi_aug: p.ghi_aug !== undefined ? Number(p.ghi_aug.toFixed(2)) : undefined,
        ghi_sep: p.ghi_sep !== undefined ? Number(p.ghi_sep.toFixed(2)) : undefined,
        ghi_oct: p.ghi_oct !== undefined ? Number(p.ghi_oct.toFixed(2)) : undefined,
        ghi_nov: p.ghi_nov !== undefined ? Number(p.ghi_nov.toFixed(2)) : undefined,
        ghi_dec: p.ghi_dec !== undefined ? Number(p.ghi_dec.toFixed(2)) : undefined,
      }))
      setProperties(mapped)
      setLoading(false)
    })
    .catch(err => {
      console.error('Error fetching properties:', err)
      setLoading(false)
    })
}, [])






const getSuitabilityColor = (score: number) => {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 65) return 'var(--color-warning)';
  if (score >= 50) return 'var(--color-info)';
  return 'var(--color-error)';
}

const getMarkerColor = getSuitabilityColor;





const getSuitabilityLabel = (score: number) => {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Poor'
}


  if (loading) {
    return <div className="loading">Loading properties...</div>
  }

  const forSaleProperties = properties.filter(p => p.forSale)
  const notForSaleProperties = properties.filter(p => !p.forSale)



  const sortedForSale = [...forSaleProperties].sort((a, b) => {
    if (sortBy === 'score') return b.suitabilityScore - a.suitabilityScore
    if (sortBy === 'acres') return b.acres - a.acres
    if (sortBy === 'price') {
      const priceA = Number(a.price.replace(/[^0-9.-]+/g, '')) || 0
      const priceB = Number(b.price.replace(/[^0-9.-]+/g, '')) || 0
      return priceB - priceA
    }
    return 0
  })

  const sortedNotForSale = [...notForSaleProperties].sort(
    (a, b) => b.suitabilityScore - a.suitabilityScore,
  )

  const currentProperties = viewMode === 'for-sale' ? sortedForSale : sortedNotForSale


  
  const filteredProperties = searchQuery.trim() === ''
    ? currentProperties
    : currentProperties.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  
  const maxPage = Math.ceil(filteredProperties.length / pageSize);
  const pagedProperties = filteredProperties.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <div>
              <h1>SolScope</h1>
              <p className="tagline">Find Perfect Land for Solar Energy</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{properties.length}</span>
              <span className="stat-label">Properties</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{properties.reduce((acc, p) => acc + p.acres, 0)}</span>
              <span className="stat-label">Total Acres</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="view-tabs">
          <button className={`tab-button ${viewMode === 'for-sale' ? 'active' : ''}`} onClick={() => setViewMode('for-sale')}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            For Sale
          </button>
          {/* <button className={`tab-button ${viewMode === 'opportunities' ? 'active' : ''}`} onClick={() => setViewMode('opportunities')}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Opportunities
          </button> */}
          <button className={`tab-button ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Map View
          </button>
        </div>

        {viewMode !== 'map' ? (
          <>
            <div className="controls">
              <div className="search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by location or property name..."
                  className="form-control"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              {viewMode === 'for-sale' && (
                <div className="sort-controls">
                  <label className="form-label">Sort by:</label>
                  <select className="form-control" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p>
                  These properties are not currently for sale but have exceptional solar potential.
                  Contact owners to explore acquisition opportunities.
                </p>
              </div>
            )}

            <div className="content-grid">
              <div className="properties-list">
                <h2 className="section-title">{viewMode === 'for-sale' ? 'Available Properties' : 'High-Potential Opportunities'}</h2>
                <div className="property-cards">
                  {pagedProperties.map(property => (
                    <div
                      key={property.id}
                      className={`property-card ${
                        selectedProperty?.id === property.id ? 'selected' : ''
                      } ${!property.forSale ? 'opportunity-card' : ''}`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      <div className="property-header">
                        <div>
                          <h3>{property.name}</h3>
                          <p className="location">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {property.location}
                          </p>
                        </div>
                        <div
                          className="score-badge"
                          style={{
                            backgroundColor: `${getSuitabilityColor(property.suitabilityScore)}20`,
                            borderColor: getSuitabilityColor(property.suitabilityScore),
                            color: getSuitabilityColor(property.suitabilityScore),
                          }}
                        >
                          <span className="score-value">{property.suitabilityScore}</span>
                          <span className="score-label">{getSuitabilityLabel(property.suitabilityScore)}</span>
                        </div>
                      </div>

                      <div className="property-metrics">
                        <div className="metric">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                          </svg>
                          <span className="metric-label">Size</span>
                          <span className="metric-value">{property.acres} acres</span>
                        </div>
                        <div className="metric">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                          </svg>
                          <span className="metric-label">Slope</span>
                          <span className="metric-value">{property.slope}°</span>
                        </div>
                        <div className="metric">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                          </svg>
                          <span className="metric-label">Sun</span>
                          <span className="metric-value">{property.sunlightHours}h</span>
                        </div>
                        <div className="metric">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          <span className="metric-label">Grid</span>
                          <span className="metric-value">{property.gridDistance}km</span>
                        </div>
                      </div>

                      {!property.forSale && property.owner && (
                        <div className="owner-section">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
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
                {viewMode === 'for-sale' && maxPage > 1 && (
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>

                  <span style={{ fontWeight: 'bold' }}>
                    Page {page} of {maxPage}
                  </span>

                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => setPage(p => Math.min(p + 1, maxPage))}
                    disabled={page === maxPage}
                  >
                    Next
                  </button>
                </div>
              )}

              </div>

              <div className="details-panel">
                {selectedProperty ? (
                  <div className="property-details">
                    <h2 className="section-title">Property Details</h2>
                    <div className="detail-card">
                      <h3>{selectedProperty.name}</h3>
                      {!selectedProperty.forSale && (
                        <span
                          className="status status--warning"
                          style={{ marginBottom: 'var(--space-12)', display: 'inline-block' }}
                        >
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
                          {selectedProperty.coordinates.lat.toFixed(4)},{' '}
                          {selectedProperty.coordinates.lng.toFixed(4)}
                        </span>
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
                        <span className="detail-label">
                          {selectedProperty.forSale ? 'Price' : 'Estimated Value'}
                        </span>
                        <span className="detail-value">
                          {selectedProperty.forSale ? selectedProperty.price : selectedProperty.estimatedValue}
                        </span>
                      </div>
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => setShowMonthlySunlight(!showMonthlySunlight)}
                      >
                        {showMonthlySunlight ? 'Hide' : 'Show'} Monthly Sunlight Hours
                      </button>

                      {showMonthlySunlight && (
                        <div className="monthly-sunlight-details">
                          <h4>Average Monthly Sunlight (kWh/m²/day)</h4>
                          <ul>
                            {selectedProperty && Object.entries({
                              Jan: selectedProperty.ghi_jan,
                              Feb: selectedProperty.ghi_feb,
                              Mar: selectedProperty.ghi_mar,
                              Apr: selectedProperty.ghi_apr,
                              May: selectedProperty.ghi_may,
                              Jun: selectedProperty.ghi_jun,
                              Jul: selectedProperty.ghi_jul,
                              Aug: selectedProperty.ghi_aug,
                              Sep: selectedProperty.ghi_sep,
                              Oct: selectedProperty.ghi_oct,
                              Nov: selectedProperty.ghi_nov,
                              Dec: selectedProperty.ghi_dec,
                            }).map(([month, value]) => (
                              <li key={month}>
                                <strong>{month}:</strong> {value !== undefined ? value.toFixed(2) : 'N/A'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="detail-card">
                      <h4>Solar Suitability Analysis</h4>
                      <div className="suitability-score">
                        <div
                          className="score-circle"
                          style={{ borderColor: getSuitabilityColor(selectedProperty.suitabilityScore) }}
                        >
                          <span className="score-number">{selectedProperty.suitabilityScore}</span>
                          <span className="score-text">{getSuitabilityLabel(selectedProperty.suitabilityScore)}</span>
                        </div>
                      </div>

                      <div className="criteria-list">
                        <div className="criteria-item">
                          <div className="criteria-header">
                            <span>Slope Analysis</span>
                            <span
                              className={
                                selectedProperty.slope !== undefined && selectedProperty.slope >= 0 && selectedProperty.slope <= 5
                                  ? 'status status--success'
                                  : 'status status--warning'
                              }
                            >
                              {selectedProperty.slope !== undefined && selectedProperty.slope >= 0 && selectedProperty.slope <= 5
                                ? 'Optimal'
                                : 'Acceptable'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.max(0, 100 - (selectedProperty.slope ?? 0) * 10)}%`,
                                backgroundColor:
                                  selectedProperty.slope !== undefined && selectedProperty.slope >= 0 && selectedProperty.slope <= 5
                                    ? 'var(--color-success)'
                                    : 'var(--color-warning)'
                              }}
                            />
                          </div>
                          <p className="criteria-note">{selectedProperty.slope}° slope (ideal: &lt;5°)</p>
                        </div>

                        <div className="criteria-item">
                          <div className="criteria-header">
                            <span>Sunlight Exposure</span>
                            <span
                              className={
                                selectedProperty.sunlightHours !== undefined && selectedProperty.sunlightHours >= 8
                                  ? 'status status--success'
                                  : 'status status--warning'
                              }
                            >
                              {selectedProperty.sunlightHours !== undefined && selectedProperty.sunlightHours >= 8 ? 'Excellent' : 'Good'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${((selectedProperty.sunlightHours ?? 0) / 12) * 100}%`,
                                backgroundColor:
                                  selectedProperty.sunlightHours !== undefined && selectedProperty.sunlightHours >= 8
                                    ? 'var(--color-success)'
                                    : 'var(--color-warning)'
                              }}
                            />
                          </div>
                          <p className="criteria-note">{selectedProperty.sunlightHours} hours daily average</p>
                        </div>

                        <div className="criteria-item">
                          <div className="criteria-header">
                            <span>Grid Proximity</span>
                            <span
                              className={
                                selectedProperty.gridDistance !== undefined && selectedProperty.gridDistance <= 2
                                  ? 'status status--success'
                                  : 'status status--warning'
                              }
                            >
                              {selectedProperty.gridDistance !== undefined && selectedProperty.gridDistance <= 2 ? 'Optimal' : 'Good'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.max(0, 100 - ((selectedProperty.gridDistance ?? 0) * 20))}%`,
                                backgroundColor:
                                  selectedProperty.gridDistance !== undefined && selectedProperty.gridDistance <= 2
                                    ? 'var(--color-success)'
                                    : 'var(--color-warning)'
                              }}
                            />
                          </div>
                          <p className="criteria-note">{selectedProperty.gridDistance} kilometers to nearest connection</p>
                        </div>

                        <div className="criteria-item">
                          <div className="criteria-header">
                            <span>Land Size</span>
                            <span
                              className={
                                selectedProperty.acres !== undefined && selectedProperty.acres >= 50
                                  ? 'status status--success'
                                  : 'status status--warning'
                              }
                            >
                              {selectedProperty.acres !== undefined && selectedProperty.acres >= 50 ? 'Large-scale ready' : 'Community-scale'}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.min(100, ((selectedProperty.acres ?? 0) / 200) * 100)}%`,
                                backgroundColor: 'var(--color-primary)', // Primary color for land size
                              }}
                            />
                          </div>
                          <p className="criteria-note">{selectedProperty.acres} acres (min. 50 for commercial)</p>
                        </div>
                      </div>

                      <div className="action-buttons">
                        {selectedProperty.forSale ? (
                          <>
                            <button className="btn btn--primary btn--full-width">Request Site Visit</button>
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
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
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
              <MapContainer center={[35.5, -110.0]} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <HeatmapLayer properties={properties} />

                {properties.map(property => (
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
                      click: () => setSelectedProperty(property),
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

            <div className="map-sidebar">
              <div className="map-legend">
                <h3>Solar Suitability Heat Map</h3>
                <p className="legend-description">Visualizing land solar potential across the southwestern United States</p>

                <div className="legend-scale">
                  <h4>Suitability Score</h4>
                <div className="legend-items">
                  <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: 'var(--color-success)' }}
                ></div>
                <span>80-100: Excellent</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: 'var(--color-warning)' }}
                  ></div>
                  <span>65-79: Good</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: 'var(--color-info)' }}
                  ></div>
                  <span>50-64: Fair</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: 'var(--color-error)' }}
                  ></div>
                  <span>{'<50'}: Poor</span>
                </div>

                </div>
                </div>

                <div className="map-instructions">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <p>Hover over markers to highlight. Click markers to view full property details.</p>
                </div>
              </div>

              <div className="map-property-list">
                <h4>Top Properties</h4>
                {[...properties]
                  .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
                  .slice(0, 3)
                  .map(property => (
                    <div
                      key={property.id}
                      className="map-property-item"
                      onClick={() => setSelectedProperty(property)}
                      onMouseEnter={() => setHoveredProperty(property.id)}
                      onMouseLeave={() => setHoveredProperty(null)}
                    >
                      <div className="map-property-header">
                        <span className="map-property-name">{property.name}</span>
                        <span className="map-property-score" style={{ color: getSuitabilityColor(property.suitabilityScore) }}>
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

export default App
