import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "./Carrito.css";

export default function Carrito({ carrito, setCarrito, abrir, setAbrir }) {
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!abrir) return;
    const onKey = (e) => {
      if (e.key === "Escape") setAbrir(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [abrir, setAbrir]);

  const vaciarCarrito = () => {
    const items = document.querySelectorAll(".carrito-item");
    items.forEach((el) => el.classList.add("eliminando"));
    setTimeout(() => {
      setCarrito([]);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("carrito:actualizado"));
    }, 300);
  };

  const getKey = (item) =>
    `${item.sku || item.id || item.nombre}-${item.porcion || 0}`;

  const cambiarCantidad = (clave, delta) => {
    const actualizado = carrito
      .map((item) => {
        const itemKey = getKey(item);
        if (itemKey === clave) {
          const nuevaCantidad = (item.cantidad || 1) + delta;
          return { ...item, cantidad: Math.max(nuevaCantidad, 0) };
        }
        return item;
      })
      .filter((item) => (item.cantidad || 0) > 0);

    setCarrito(actualizado);
    localStorage.setItem("carrito", JSON.stringify(actualizado));
    window.dispatchEvent(new Event("carrito:actualizado"));
  };

  const eliminarItem = (clave) => {
    const elemento = document.getElementById(`item-${clave}`);
    if (elemento) elemento.classList.add("eliminando");
    setTimeout(() => {
      const actualizado = carrito.filter((item) => getKey(item) !== clave);
      setCarrito(actualizado);
      localStorage.setItem("carrito", JSON.stringify(actualizado));
      window.dispatchEvent(new Event("carrito:actualizado"));
    }, 250);
  };

  const cerrarCarrito = () => setAbrir(false);

  const total = carrito.reduce((acc, item) => {
    const precio = Number(item.precio || 0);
    const cant = Number(item.cantidad || 1);
    return acc + precio * cant;
  }, 0);

  const finalizarCompra = async () => {
    const usuario = JSON.parse(localStorage.getItem("sdh_user"));
    if (!usuario || !usuario.id) {
      alert("Debes iniciar sesión para finalizar la compra.");
      return;
    }
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    try {
      setProcesando(true);

      const detalle = carrito
        .filter((item) => !item.esPersonalizado)
        .map((item) => ({
          sku: item.sku,
          cantidad: item.cantidad || 1,
          precio_unitario: item.precio,
          porcion: item.porcion || null,
        }));

      const personalizados = carrito
        .filter((item) => item.esPersonalizado)
        .map((item) => {
          const d = item.detalle || {};
          return {
            tipo: d.tipo || "personalizado",
            cantidad: item.cantidad || 1,
            bizcocho: d.bizcocho || null,
            relleno: d.relleno || null,
            cobertura: d.cobertura || null,
            toppings: Array.isArray(d.toppings)
              ? d.toppings.join(",")
              : d.toppings || null,
          };
        });

      const totalFinal = carrito.reduce((acc, p) => {
        const precio = Number(p.precio || 0);
        const cant = Number(p.cantidad || 1);
        return acc + precio * cant;
      }, 0);

      const pedidoData = {
        id_usuario: usuario.id,
        total: totalFinal,
        estado: "pendiente",
        codigo_descuento: null,
        fecha_entrega: null,
        detalle,
        personalizados,
      };

      const respPedido = await fetch("http://localhost:5000/api/pedidos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData),
      });

      const dataPedido = await respPedido.json();
      if (!respPedido.ok)
        throw new Error(dataPedido.message || "Error al registrar el pedido");

      const orderId =
        dataPedido.id_pedido ||
        dataPedido.pedido?.id ||
        dataPedido.id ||
        dataPedido.orderId;

      const payerEmail = usuario.correo || usuario.email || "";

      const items = carrito
        .map((p) => ({
          title: p.nombre || "Producto",
          quantity: Number(p.cantidad || 1),
          unit_price: Number(p.precio || 0),
        }))
        .filter((i) => i.quantity > 0 && i.unit_price > 0);

      if (!orderId || !payerEmail || items.length === 0) {
        alert("Datos incompletos para Mercado Pago.");
        setProcesando(false);
        return;
      }

      const respMP = await fetch("http://localhost:5000/api/mp/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, payerEmail, items }),
      });

      const dataMP = await respMP.json();
      if (!respMP.ok) {
        console.error("MP resp:", dataMP);
        alert(`Error Mercado Pago: ${dataMP.details || dataMP.error || "sin detalle"}`);
        throw new Error(dataMP.details || "No se pudo crear la preferencia de pago");
      }

      if (!(dataMP.init_point || dataMP.sandbox_init_point))
        throw new Error("No se pudo crear la preferencia de pago");

      setCarrito([]);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("carrito:actualizado"));
      setAbrir(false);

      // Aquí se prioriza init_point (producción). Si no está, usa sandbox_init_point.
      const checkoutUrl = dataMP.init_point || dataMP.sandbox_init_point;
      console.log("[MP DEBUG] checkoutUrl:", checkoutUrl, "response:", dataMP);
      window.location.assign(checkoutUrl);
    } catch (error) {
      console.error("Error al finalizar compra:", error);
      alert("Hubo un problema al procesar el pago. Intenta nuevamente.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div
        className={`carrito-overlay ${abrir ? "activo" : ""}`}
        onClick={cerrarCarrito}
      />
      <aside
        className={`carrito-sidebar ${abrir ? "activo" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Tu Carrito"
      >
        <div className="carrito-header">
          <h2>Tu Carrito</h2>
        </div>

        {carrito.length === 0 ? (
          <p className="carrito-vacio">El carrito está vacío</p>
        ) : (
          <div className="carrito-body">
            {carrito.map((item) => {
              const clave = getKey(item);
              const precioUnit = Number(item.precio || 0);
              const cant = Number(item.cantidad || 1);
              const subtotal = precioUnit * cant;

              return (
                <div key={clave} id={`item-${clave}`} className="carrito-item">
                  <img src={item.imagen} alt={item.nombre} />
                  <div className="info-item">
                    <h3>
                      {item.esPersonalizado ? "🍰 Postre personalizado" : item.nombre}
                    </h3>

                    {item.porcion && <p>Porciones: {item.porcion}</p>}

                    <p>Precio unitario: ${precioUnit.toLocaleString("es-CL")}</p>

                    {item.esPersonalizado && (
                      <div className="detalle-personalizado">
                        {Object.entries(item.detalle || {}).map(([k, v]) => (
                          <p key={k}>
                            <strong>{k}:</strong>{" "}
                            {Array.isArray(v) ? v.join(", ") : v}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="cantidad-controles">
                      <button onClick={() => cambiarCantidad(clave, -1)}>
                        <FaMinus />
                      </button>
                      <span>{cant}</span>
                      <button onClick={() => cambiarCantidad(clave, 1)}>
                        <FaPlus />
                      </button>
                    </div>

                    <p className="subtotal">
                      Subtotal: ${subtotal.toLocaleString("es-CL")}
                    </p>
                  </div>

                  <button
                    className="item-eliminar"
                    onClick={() => eliminarItem(clave)}
                    title="Eliminar producto"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="carrito-footer">
          <p className="carrito-total">Total: ${total.toLocaleString("es-CL")}</p>
          <button className="vaciar-btn" onClick={vaciarCarrito}>
            <FaTrash /> Vaciar Carrito
          </button>
          <button className="finalizar-btn" disabled={procesando} onClick={finalizarCompra}>
            {procesando ? "Procesando..." : "Finalizar Compra"}
          </button>
        </div>
      </aside>
    </>
  );
}
