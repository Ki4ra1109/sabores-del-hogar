import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../views/Home/Home";
import Catalogo from "../views/Catalogo/Catalogo";

export default function AppRouter() {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
        </Routes>
      </main>
    </Router>
  );
}