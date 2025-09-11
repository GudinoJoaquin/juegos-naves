import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PlayerSelect from "./pages/PlayerSelect";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PlayerSelect />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}
