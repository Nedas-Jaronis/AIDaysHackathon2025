import { Routes, Route, Navigate } from "react-router-dom";
import {ForSalePage} from "./pages/ForSalePage";
import {OpportunitiesPage} from "./pages/OpportunitiesPage";
import {MapPage} from "./pages/MapPage";

import OldApp from "./old/OldApp.tsx";
import NewApp from "./new/NewApp.tsx";

export default function App() {
  return (
    <Routes>

      {/* Top-level flat routes */}
      <Route path="/for-sale" element={<ForSalePage />} />
      <Route path="/opportunities" element={<OpportunitiesPage />} />
      <Route path="/map" element={<MapPage />} />

      <Route path="/new" element={<NewApp />}/>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/for-sale" replace />} />

      {/* Old */}
      <Route path="/old" element={<OldApp />} />
    </Routes>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<ForSalePage />} />
        <Route path="for-sale" element={<ForSalePage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="map" element={<MapPage />} />
      </Route>
    </Routes>
  );
}