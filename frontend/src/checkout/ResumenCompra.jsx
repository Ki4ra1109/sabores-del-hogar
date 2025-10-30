import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { Header } from "../componentes/Header";
import { Footer } from "../componentes/Footer";
import "./ResumenCompra.css";

export default function ResumenCompra() {
  const { carrito, setCarrito } = useCarrito();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sdh_user") || "null"); } catch { return null; }
  }, []);

  const total = useMemo(
    () => carrito.reduce((acc, p) => acc + Number(p.precio || 0) * Number(p.cantidad || 1), 0),
    [carrito]
  );

  const confirmarYComprar = async () => {
    if (!usuario?.id) { alert("Debes iniciar sesión."); navigate("/login"); return; }
    if (!carrito.length) { alert("Tu carrito está vacío."); navigate("/catalogo"); return; }
    try {
      setProcesando(true);
      const detalle = carrito.filter(i => !i.esPersonalizado).map(i => ({
        sku: i.sku, cantidad: i.cantidad || 1, precio_unitario: i.precio, porcion: i.porcion || null
      }));
      const personalizados = carrito.filter(i => i.esPersonalizado).map(i => {
        const d = i.detalle || {};
        return {
          tipo: d.tipo || "personalizado",
          cantidad: i.cantidad || 1,
          bizcocho: d.bizcocho || null,
          relleno: d.relleno || null,
          cobertura: d.cobertura || null,
          toppings: Array.isArray(d.toppings) ? d.toppings.join(",") : d.toppings || null
        };
      });
      const rPedido = await fetch(`${API_URL}/api/pedidos/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id, total, estado: "pendiente",
          codigo_descuento: null, fecha_entrega: null, detalle, personalizados
        })
      });
      const dPedido = await rPedido.json();
      if (!rPedido.ok) throw new Error(dPedido?.message || "Error al crear pedido");
      const orderId = dPedido.id_pedido || dPedido?.pedido?.id || dPedido?.id || dPedido?.orderId;
      if (!orderId) throw new Error("No se obtuvo id de pedido");

      const items = carrito.map(p => ({
        title: p.nombre || "Producto",
        quantity: Number(p.cantidad || 1),
        unit_price: Number(p.precio || 0)
      })).filter(i => i.quantity > 0 && i.unit_price > 0);

      const payerEmail = usuario.correo || usuario.email || "";
      const rMP = await fetch(`${API_URL}/api/mp/preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, payerEmail, items })
      });
      const dMP = await rMP.json();
      if (!rMP.ok) throw new Error(dMP?.details || dMP?.error || "Error al crear preferencia");

      const checkoutUrl = dMP.init_point || dMP.sandbox_init_point;
      if (!checkoutUrl) throw new Error("No se obtuvo URL de checkout");

      setCarrito([]);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("carrito:actualizado"));
      window.location.assign(checkoutUrl);
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al iniciar el pago");
    } finally {
      setProcesando(false);
    }
  };

  const volver = () => navigate("/catalogo");

  return (
    <>
      <Header />
      <div className="rc-page">
        <div className="rc-wrap rc-flex-fill">
          <h1 className="rc-h1">Resumen de compra</h1>
          {!carrito.length ? (
            <p>No hay productos en el carrito.</p>
          ) : (
            <div className="rc-grid">
              <div className="rc-card rc-list">
                {carrito.map((item, idx) => {
                  const subtotal = Number(item.precio || 0) * Number(item.cantidad || 1);
                  const puedeLink = item.sku && String(item.sku).trim().length > 0;
                  const Thumb = (
                    <img src={item.imagen} alt={item.nombre} className="rc-thumb" />
                  );
                  return (
                    <div key={idx} className="rc-item">
                      {item.imagen ? (
                        puedeLink ? (
                          <Link to={`/catalogo/${item.sku}`} className="rc-thumbLink" aria-label={item.nombre}>
                            {Thumb}
                          </Link>
                        ) : (
                          Thumb
                        )
                      ) : null}
                      <div className="rc-main">
                        <div className="rc-title">
                          {puedeLink ? (
                            <Link to={`/catalogo/${item.sku}`} className="rc-titleLink">{item.esPersonalizado ? "Postre personalizado" : item.nombre}</Link>
                          ) : (
                            <span>{item.esPersonalizado ? "Postre personalizado" : item.nombre}</span>
                          )}
                        </div>
                        <div className="rc-meta">
                          {item.porcion && <span>Porciones: {item.porcion}</span>}
                          <span>Precio unitario: ${Number(item.precio || 0).toLocaleString("es-CL")}</span>
                          <span>Cantidad: {item.cantidad || 1}</span>
                        </div>
                        {item.esPersonalizado && item.detalle && (
                          <div className="rc-extra">
                            {Object.entries(item.detalle).map(([k, v]) => (
                              <div key={k}><strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : String(v)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="rc-subtotal">${subtotal.toLocaleString("es-CL")}</div>
                    </div>
                  );
                })}
              </div>

              <div className="rc-card rc-total">
                <div className="rc-totalLabel">Total</div>
                <div className="rc-totalAmount">${total.toLocaleString("es-CL")}</div>
                <div className="rc-actions">
                  <button type="button" className="rc-btn rc-btn-ghost" onClick={volver} disabled={procesando}>Seguir comprando</button>
                  <button type="button" className="rc-btn rc-btn-mp" onClick={confirmarYComprar} disabled={procesando}>
                    {procesando ? "Procesando..." : "Pagar con Mercado Pago"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
