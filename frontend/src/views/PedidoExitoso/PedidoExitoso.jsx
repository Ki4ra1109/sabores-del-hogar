import React, { useMemo, useState } from "react";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import { useCarrito } from "../../context/carritoContext";
import "./PedidoExitoso.css";

export default function PedidoExitoso() {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpia carrito en caso de recargar la página
    localStorage.removeItem("carrito");
  }, []);

  return (
    <div className="pedido-exitoso-container">
      <FaCheckCircle className="icono-exito" />
      <h1>¡Pedido realizado con éxito!</h1>
      <p>Tu pedido ha sido confirmado y está siendo preparado. 🎉</p>
      <p>Pronto recibirás un correo con los detalles de tu compra.</p>

      <div className="botones">
        <button onClick={() => navigate("/catalogo")}>
          Seguir comprando
        </button>
        <button onClick={() => navigate("/perfil")}>
          Ver mis pedidos
        </button>
      </div>
    </div>
  );
}
