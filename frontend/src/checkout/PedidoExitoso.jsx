import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { Header } from "../componentes/Header";
import { Footer } from "../componentes/Footer";
import "./StatusPago.css"; 

export default function PedidoExitoso() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");
  const orderId = searchParams.get("orderId") || externalReference;
  const [pedido, setPedido] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    localStorage.removeItem("carrito");
    window.dispatchEvent(new Event("carrito:actualizado"));
    (async () => {
      try {
        if (orderId) {
          await fetch(`${API_URL}/api/mp/status/${orderId}`).catch(() => {});
          const r = await fetch(`${API_URL}/api/pedidos/${orderId}`);
          if (r.ok) {
            const data = await r.json();
            setPedido(data);
          }
        }
      } catch {}
    })();
  }, [API_URL, orderId]);

  return (
    <>
      <Header />
      <div className="status-pago-container">
        <FaCheckCircle className="icono-status status-success" />
        <h1>¡Pedido realizado con éxito!</h1>
        <p>Tu pago ha sido aprobado y tu pedido está siendo preparado.</p>

        {orderId && <p>Tu número de pedido es: <strong>{orderId}</strong></p>}
        {pedido?.numero_orden && <p>Orden: <strong>{pedido.numero_orden}</strong></p>}
        {pedido?.estado_pago && <p>Estado de pago: <strong>{pedido.estado_pago}</strong></p>}
        {pedido?.metodo_pago && <p>Método: <strong>{pedido.metodo_pago}</strong></p>}
        {paymentId && <p>ID de pago: {paymentId}</p>}

        <div className="botones-status">
          <Link to="/catalogo" className="btn-status">Seguir comprando</Link>
          <Link to="/perfil" className="btn-status">Ver mis pedidos</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
