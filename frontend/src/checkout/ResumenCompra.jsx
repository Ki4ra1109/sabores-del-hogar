import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { Header } from "../componentes/Header";
import { Footer } from "../componentes/Footer";
import "./ResumenCompra.css";

export default function ResumenCompra() {
  const { carrito } = useCarrito();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [cup, setCup] = useState(null);
  const [aplicando, setAplicando] = useState(false);
  const [msg, setMsg] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sdh_user") || "null"); } catch { return null; }
  }, []);

  const subtotal = useMemo(
    () => carrito.reduce((acc, p) => acc + Number(p.precio || 0) * Number(p.cantidad || 1), 0),
    [carrito]
  );
  const descuento = useMemo(() => Number(cup?.discountValue || 0), [cup]);
  const total = useMemo(() => Math.max(0, subtotal - descuento), [subtotal, descuento]);

  const pctDisplay = useMemo(() => {
    if (!cup) return 0;
    const cands = [cup.porcentaje, cup.percent, cup.percentage, cup.valor];
    for (const v of cands) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0 && n <= 100) return n;
    }
    if (subtotal > 0) return Math.round((Number(cup.discountValue || 0) / subtotal) * 100);
    return 0;
  }, [cup, subtotal]);

  const couponType = useMemo(() => {
    if (!cup) return "";
    const t = cup.tipo || (cup.porcentaje != null ? "percent" : (cup.valor != null ? "amount" : "free_shipping"));
    if (t === "percent") return `Cupón ${pctDisplay}% de descuento`;
    if (t === "amount") return `Cupón $${Number(cup.valor || 0).toLocaleString("es-CL")} de descuento`;
    if (t === "free_shipping") return "Cupón de envío gratis";
    return "Cupón aplicado";
  }, [cup, pctDisplay]);

  const showMsg = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 1000);
  };

  const aplicarCupon = async () => {
    const code = (codigo || "").trim().toUpperCase();
    if (!code) return;
    setAplicando(true);
    try {
      const r = await fetch(`${API_URL}/api/cupones/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: code, subtotal, shipping: 0 })
      });
      const j = await r.json();
      if (!j.ok) { showMsg(j.message || "Cupón inválido", "err"); return; }
      const c = j.coupon || j.descuento || j.data || {};
      setCup({
        code,
        tipo: c.tipo || j.tipo,
        porcentaje: c.porcentaje ?? j.porcentaje ?? null,
        valor: c.valor ?? j.valor ?? null,
        discountValue: Number(j.discountValue ?? j.monto_descuento ?? j.discount ?? 0)
      });
      showMsg("Cupón aplicado", "ok");
    } catch {
      showMsg("Error al validar cupón", "err");
    } finally {
      setAplicando(false);
    }
  };

  const quitarCupon = () => {
    setCup(null);
    setCodigo("");
  };

  const confirmarYComprar = async () => {
    if (procesando) return;
    if (!usuario?.id) { alert("Debes iniciar sesión."); navigate("/login"); return; }
    if (!carrito.length) { alert("Tu carrito está vacío."); navigate("/catalogo"); return; }

    try {
      setProcesando(true);

      const detalle = carrito.filter(i => !i.esPersonalizado).map(i => ({
        sku: i.sku,
        cantidad: Number(i.cantidad || 1),
        precio_unitario: Number(i.precio || 0),
        porcion: i.porcion || null
      }));

      const personalizados = carrito.filter(i => i.esPersonalizado).map(i => {
        const d = i.detalle || {};
        return {
          tipo: d.tipo || "personalizado",
          cantidad: Number(i.cantidad || 1),
          bizcocho: d.bizcocho || null,
          relleno: d.relleno || null,
          cobertura: d.cobertura || null,
          toppings: Array.isArray(d.toppings) ? d.toppings.join(",") : d.toppings || null
        };
      });

      const payloadPedido = {
        id_usuario: usuario.id,
        estado: "pendiente",
        subtotal: Math.round(subtotal),
        descuento_aplicado: Math.round(descuento),
        total: Math.round(total),
        codigo_descuento: cup?.code || null,
        cupon: cup
          ? {
              tipo: cup.tipo || null,
              porcentaje: cup.porcentaje ?? null,
              valor: cup.valor ?? null
            }
          : null,
        fecha_entrega: null,
        detalle,
        personalizados
      };

      const rPedido = await fetch(`${API_URL}/api/pedidos/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadPedido)
      });

      const dPedido = await rPedido.json().catch(() => ({}));
      if (!rPedido.ok || dPedido?.ok === false) {
        const m = dPedido?.message || dPedido?.error || "Error interno al registrar el pedido";
        throw new Error(m);
      }

      const orderId =
        dPedido.id_pedido ||
        dPedido?.pedido?.id ||
        dPedido?.id ||
        dPedido?.orderId;

      if (!orderId) throw new Error("No se obtuvo id de pedido");

      const monto = Math.round(total);
      if (monto <= 0) { alert("El total debe ser mayor a 0"); setProcesando(false); return; }

      const payerEmail = usuario.correo || usuario.email || "";

      const rMP = await fetch(`${API_URL}/api/mp/preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, payerEmail })
      });

      const dMP = await rMP.json().catch(() => ({}));
      if (!rMP.ok) {
        const m = dMP?.details || dMP?.error || "Error al crear preferencia";
        throw new Error(m);
      }

      const checkoutUrl = dMP.init_point || dMP.sandbox_init_point;
      if (!checkoutUrl) throw new Error("No se obtuvo URL de checkout");

      sessionStorage.setItem("sdh_last_order", JSON.stringify({ orderId, t: Date.now() }));
      window.location.assign(checkoutUrl);
    } catch (e) {
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
                  const subtotalItem = Number(item.precio || 0) * Number(item.cantidad || 1);
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
                      <div className="rc-subtotal">${subtotalItem.toLocaleString("es-CL")}</div>
                    </div>
                  );
                })}
              </div>

              <div className="rc-card rc-total">
                <div className="rc-totalLabel">Total</div>
                <div className="rc-totalAmount">${total.toLocaleString("es-CL")}</div>

                <div className="rc-couponBox">
                  <div className="rc-couponRow">
                    <input
                      className="rc-couponInput"
                      value={codigo}
                      onChange={(e) => setCodigo((e.target.value || "").toUpperCase())}
                      placeholder="Código de descuento"
                    />
                    {cup ? (
                      <button type="button" className="rc-btn rc-btn-apply" onClick={quitarCupon}>Quitar</button>
                    ) : (
                      <button
                        type="button"
                        className="rc-btn rc-btn-apply"
                        onClick={aplicarCupon}
                        disabled={aplicando || !codigo.trim()}
                      >
                        {aplicando ? "Aplicando..." : "Aplicar"}
                      </button>
                    )}
                  </div>
                  {msg && <div className={`rc-coupon-msg ${msg.type}`}>{msg.text}</div>}

                  <div className="rc-sep" />

                  <div className="rc-sumRow">
                    <span>Subtotal</span>
                    <strong>${subtotal.toLocaleString("es-CL")}</strong>
                  </div>

                  <div className="rc-sumRow">
                    <span>{cup ? `${couponType} (${cup.code})` : "Descuento"}</span>
                    <strong>-${descuento.toLocaleString("es-CL")}</strong>
                  </div>

                  <div className="rc-totalRow">
                    <span>Total</span>
                    <div className="rc-totalRight">
                      <span className="rc-currency">CLP</span>
                      <strong>${total.toLocaleString("es-CL")}</strong>
                    </div>
                  </div>
                </div>

                <div className="rc-actions">
                  <button type="button" className="rc-btn rc-btn-ghost" onClick={volver} disabled={procesando}>Seguir comprando</button>
                  <button type="button" className="rc-btn rc-btn-mp" onClick={confirmarYComprar} disabled={procesando}>
                    {procesando ? "Procesando el pago..." : "Pagar con Mercado Pago"}
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
