import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../views/Home/Home";
import Catalogo from "../views/Catalogo/Catalogo";
import ProductoDetalle from "../views/Catalogo/ProductoDetalle.jsx";
import Login from "../views/Login/Login";
import UserNormal from "../views/Users/Normal/UserNormal";
import UserAdmin from "../views/Users/Admin/UserAdmin";
import Nosotros from "../views/Nosotros/Nosotros";
import Postre from "../views/Postre/Postre";
import PoliticaPrivacidad from "../views/Legales/PoliticaPrivacidad";
import TerminosCondiciones from "../views/Legales/TerminosCondiciones";


export default function AppRouter() {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<ProductoDetalle />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/UserNormal" element={<UserNormal />} />
          <Route path="/UserAdmin" element={<UserAdmin />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/postre" element={<Postre />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />

        </Routes>
      </main>
    </Router>
  );
}
