import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../views/Home/Home";
import Catalogo from "../views/Catalogo/Catalogo";
import Login from "../views/Login/Login";
import Nosotros from "../views/Nosotros/Nosotros";

export default function AppRouter() {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Catalogo" element={<Catalogo />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/nosotros" element={<Nosotros />} />
        </Routes>
      </main>
    </Router>
  );
}