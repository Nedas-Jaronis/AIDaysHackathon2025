import { BrowserRouter, Routes, Route } from "react-router-dom";
import OldApp from "./old/OldApp";
import NewApp from "./new/NewApp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/old" element={<OldApp />} />
        <Route path="/new" element={<NewApp />} />
      </Routes>
    </BrowserRouter>
  );
}
