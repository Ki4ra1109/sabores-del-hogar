import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaHourglassHalf } from "react-icons/fa";
import { Header } from "../componentes/Header";
import { Footer } from "../componentes/Footer";
import "./StatusPago.css";

export default function PedidoPendiente() {
  const [searchParams] = useSearchParams();
  const externalReference = searchParams.get("external_reference");
  const orderId = searchParams.get("orderId") || externalReference;
  const [pedido, setPedido] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!orderId) return;
    let stopped = false;
    const start = Date.now();

    const load = async () => {
      try {
        await fetch(`${API_URL}/api/mp/status/${orderId}`).catch(() => {});
        const r = await fetch(`${API_URL}/api/pedidos/${orderId}`);
        if (r.ok) {
          const d = await r.json();
          setPedido(d);
          const s = String(d.estado_pago || d.estado || "").toLowerCase();
          const fin = s.includes("aprob") || s === "approved" || s.includes("rechaz") || s === "rejected";
          if (!fin && Date.now() - start < 30000 && !stopped) setTimeout(load, 2000);
        } else if (Date.now() - start < 30000 && !stopped) {
          setTimeout(load, 2000);
        }
      } catch {
        if (Date.now() - start < 30000 && !stopped) setTimeout(load, 2000);
      }
    };

    load();
    return () => { stopped = true; };
  }, [API_URL, orderId]);

  return (
    <>
      <Header />
      <div className="status-pago-container">
        <FaHourglassHalf className="icono-status status-pending" />
        <h1>Pago Pendiente</h1>
        <p>Tu pedido ha sido recibido, pero estamos esperando la confirmación del pago.</p>
        <p>Esto puede tomar unos minutos o hasta 24 horas si pagaste en efectivo.</p>

        {orderId && <p>Tu número de pedido es: <strong>{orderId}</strong></p>}
        {pedido?.estado_pago && <p>Estado de pago: <strong>{pedido.estado_pago}</strong></p>}
        {pedido?.metodo_pago && <p>Método: <strong>{pedido.metodo_pago}</strong></p>}
        {pedido?.numero_orden && <p>Orden: <strong>{pedido.numero_orden}</strong></p>}

        <div className="botones-status">
          <Link to="/perfil" className="btn-status">Ver estado del pedido</Link>
          <Link to="/" className="btn-status">Volver al inicio</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
