import { BrowserRouter, Routes, Route, Link, useLocation, Outlet } from "react-router-dom"
import { ForSalePage } from "../pages/ForSalePage"
import { OpportunitiesPage } from "../pages/OpportunitiesPage"
import { MapPage } from "../pages/MapPage"
import { useProperties } from "../hooks/useProperties"

function Tabs() {
  const { pathname } = useLocation()
  return (
    <div className="view-tabs">
      <Link to="/for-sale" className={`tab-button ${pathname === "/for-sale" ? "active" : ""}`}>
        {/* Home icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        For Sale
      </Link>

      <Link to="/opportunities" className={`tab-button ${pathname === "/opportunities" ? "active" : ""}`}>
        {/* Clock icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Opportunities
      </Link>

      <Link to="/map" className={`tab-button ${pathname === "/map" ? "active" : ""}`}>
        {/* Map icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
        Map View
      </Link>
    </div>
  )
}

function HeaderStats() {
  // HYBRID: pull once here for header stats
  const { properties } = useProperties()
  const total = properties.length
  const acres = properties.reduce((sum, p) => sum + (Number.isFinite(p.acres) ? p.acres : 0), 0)

  return (
    <div className="header-stats">
      <div className="stat-item">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Properties</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{Math.round(acres)}</span>
        <span className="stat-label">Total Acres</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    //<BrowserRouter>
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

            {/* HEADER_YES */}
            <HeaderStats />
          </div>
        </header>

        <main className="main-content">
          <Tabs />
          <Outlet />
        </main>
      </div>
    //</BrowserRouter>
  )
}
