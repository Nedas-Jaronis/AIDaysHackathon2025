import { BrowserRouter, Routes, Route, Link, useLocation, Outlet } from "react-router-dom"
import { ForSalePage } from "../pages/ForSalePage"
import { OpportunitiesPage } from "../pages/OpportunitiesPage"
import { MapPage } from "../pages/MapPage"
import { useProperties } from "../hooks/useProperties"

import Tabs from "../components/Tabs"

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
