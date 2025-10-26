import { Routes, Route, Outlet, Navigate, NavLink } from "react-router-dom";
import {ForSalePage} from "./pages/ForSalePage";
import {OpportunitiesPage} from "./pages/OpportunitiesPage";
import {MapPage} from "./pages/MapPage";

import Tabs from "./components/Tabs"

// Reuse your existing HeaderStats and Tabs components from this file

function Layout() {
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

        </div>
      </header>

      <main className="main-content">
        <Tabs />
        <Outlet /> {/* ← children render here; header/tabs stay */}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ForSalePage />} />
        <Route path="for-sale" element={<ForSalePage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="*" element={<Navigate to="/for-sale" replace />} />
      </Route>
    </Routes>
  );
}
