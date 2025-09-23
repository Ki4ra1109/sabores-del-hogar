import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../views/Home/Home";
import Catalogo from "../views/Catalogo/Catalogo";
import ProductoDetalle from "../views/Catalogo/ProductoDetalle.jsx";
import Login from "../views/Login/Login";
import UserNormal from "../views/Users/Normal/UserNormal";
import UserAdmin from "../views/Users/Admin/UserAdmin";
import Perfil from "../views/Users/Normal/Perfil"; // NUEVO
import Nosotros from "../views/Nosotros/Nosotros";
import Postre from "../views/Postre/Postre";
import PoliticaPrivacidad from "../views/Legales/PoliticaPrivacidad";
import TerminosCondiciones from "../views/Legales/TerminosCondiciones";
import Contacto from "../views/Legales/Contacto";

const isLoggedIn = () => !!localStorage.getItem("sdh_user");
const isAdmin = () => {
  try {
    const u = JSON.parse(localStorage.getItem("sdh_user") || "null");
    return String(u?.rol || "").toLowerCase() === "admin";
  } catch {
    return false;
  }
};

const RequireAuth = ({ children }) =>
  isLoggedIn() ? children : <Navigate to="/login" replace />;

const RequireAdmin = ({ children }) =>
  isAdmin() ? children : <Navigate to="/" replace />;

export default function AppRouter() {
  return (
    <Router>
      <main>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:sku" element={<ProductoDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/postre" element={<Postre />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
          <Route path="/contacto" element={<Contacto />} />

          {/* Privadas */}
          <Route
            path="/UserNormal"
            element={
              <RequireAuth>
                <UserNormal />
              </RequireAuth>
            }
          />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <Perfil />
              </RequireAuth>
            }
          />
          <Route
            path="/UserAdmin"
            element={
              <RequireAdmin>
                <UserAdmin />
              </RequireAdmin>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}
