import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../views/Home/Home";
import Catalogo from "../views/Catalogo/Catalogo";
import ProductoDetalle from "../views/Catalogo/ProductoDetalle.jsx";
import UserNormal from "../views/Users/Normal/UserNormal";
import UserAdmin from "../views/Users/Admin/UserAdmin";
import Perfil from "../views/Users/Normal/Perfil";
import Nosotros from "../views/Nosotros/Nosotros";
import Postre from "../views/Postre/Postre";
import PoliticaPrivacidad from "../views/Legales/PoliticaPrivacidad";
import TerminosCondiciones from "../views/Legales/TerminosCondiciones";
import Contacto from "../views/Legales/Contacto";

import PedidoExitoso from "../checkout/PedidoExitoso";
import PedidoPendiente from "../checkout/PedidoPendiente";
import PedidoFallido from "../checkout/PedidoFallido";
import ResumenCompra from "../checkout/ResumenCompra";

const Login = lazy(() => import("../views/Login/Login"));

const isLoggedIn = () => !!localStorage.getItem("sdh_user");
const isAdmin = () => {
  try {
    const u = JSON.parse(localStorage.getItem("sdh_user") || "null");
    return String(u?.rol || "").toLowerCase() === "admin";
  } catch { return false; }
};

const RequireAuth  = ({ children }) => isLoggedIn() ? children : <Navigate to="/login" replace />;
const RequireAdmin = ({ children }) => isAdmin()     ? children : <Navigate to="/" replace />;

export default function AppRouter() {
  return (
    <main>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:sku" element={<ProductoDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/postre" element={<Postre />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
          <Route path="/contacto" element={<Contacto />} />

          <Route path="/pedido-exitoso" element={<PedidoExitoso />} />
          <Route path="/pedido-pendiente" element={<PedidoPendiente />} />
          <Route path="/pedido-fallido" element={<PedidoFallido />} />
          <Route path="/resumen-compra" element={<ResumenCompra />} />

          <Route path="/UserNormal" element={<RequireAuth><UserNormal /></RequireAuth>} />
          <Route path="/perfil"     element={<RequireAuth><Perfil /></RequireAuth>} />
          <Route path="/UserAdmin"  element={<RequireAdmin><UserAdmin /></RequireAdmin>} />
          <Route path="/UserAdmin/dashboard" element={<RequireAdmin><UserAdmin view="dashboard" /></RequireAdmin>}/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
  );
}
