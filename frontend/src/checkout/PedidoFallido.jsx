import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import { Header } from "../componentes/Header";
import { Footer } from "../componentes/Footer";
import "./StatusPago.css";

export default function PedidoFallido() {
  const [searchParams] = useSearchParams();
  const externalReference = searchParams.get("external_reference");
  const orderId = searchParams.get("orderId") || externalReference;

  return (
    <>
      <Header />
      <div className="status-pago-container">
        <FaTimesCircle className="icono-status status-failure" />
        <h1>Pago Rechazado</h1>
        <p>Lamentablemente, tu pago no pudo ser procesado.</p>
        <p>No se ha realizado ningún cargo a tu cuenta. Por favor, inténtalo de nuevo.</p>

        {orderId && <p>Pedido asociado: <strong>{orderId}</strong></p>}

        <div className="botones-status">
          <Link to="/catalogo" className="btn-status">Intentar de nuevo</Link> 
        </div>
      </div>
      <Footer />
    </>
  );
}
