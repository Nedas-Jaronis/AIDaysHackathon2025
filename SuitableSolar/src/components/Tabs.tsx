import { NavLink } from "react-router-dom";

export default function Tabs() {
  return (
    <div className="view-tabs">
      <NavLink
        to="for-sale"
        className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        For Sale
      </NavLink>

      <NavLink
        to="opportunities"
        className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Opportunities
      </NavLink>

      <NavLink
        to="map"
        className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
        Map View
      </NavLink>
    </div>
  );
}
