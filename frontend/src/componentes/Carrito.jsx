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
  }, [abrir]);

  const vaciarCarrito = () => {
    const items = document.querySelectorAll(".carrito-item");
    items.forEach((el) => el.classList.add("eliminando"));
    setTimeout(() => {
      setCarrito([]);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("carrito:actualizado"));
    }, 300);
  };

  const getKey = (item) => `${item.sku || item.id || item.nombre}-${item.porcion || 0}`;

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

  // Total recalculado considerando personalizados
  const total = carrito.reduce((acc, item) => {
    if (!item.esPersonalizado) return acc + item.precio * (item.cantidad || 1);
    return acc + (item.precio || 0);
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

      const detalle = carrito.map((item) => {
        if (!item.esPersonalizado) {
          return {
            sku: item.sku,
            cantidad: item.cantidad || 1,
            precio_unitario: item.precio,
            porcion: item.porcion || null,
          };
        } else {
          return {
            id: item.id,
            detalle: item.detalle,
            precio_unitario: item.precio,
          };
        }
      });

      const totalFinal = detalle.reduce((acc, p) => {
        if (p.sku) return acc + p.precio_unitario * (p.cantidad || 1);
        if (p.detalle) return acc + p.precio_unitario;
        return acc;
      }, 0);

      const pedidoData = {
        id_usuario: usuario.id,
        total: totalFinal,
        estado: "pendiente",
        codigo_descuento: null,
        fecha_entrega: null,
        detalle,
      };

      const response = await fetch("http://localhost:5000/api/pedidos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error al registrar el pedido");

      setCarrito([]);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("carrito:actualizado"));
      setAbrir(false);
      window.location.href = "/pedido-exitoso";
    } catch (error) {
      console.error("Error al finalizar compra:", error);
      alert("Hubo un problema al registrar el pedido. Intenta nuevamente.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className={`carrito-overlay ${abrir ? "activo" : ""}`} onClick={cerrarCarrito} />
      <aside className={`carrito-sidebar ${abrir ? "activo" : ""}`} role="dialog" aria-modal="true" aria-label="Tu Carrito">
        <div className="carrito-header">
          <h2>Tu Carrito</h2>
        </div>

        {carrito.length === 0 ? (
          <p className="carrito-vacio">El carrito está vacío</p>
        ) : (
          <div className="carrito-body">
            {carrito.map((item) => {
              const clave = getKey(item);
              return (
                <div key={clave} id={`item-${clave}`} className="carrito-item">
                  <img src={item.imagen} alt={item.nombre} />
                  <div className="info-item">
                    <h3>{item.esPersonalizado ? "🍰 Postre personalizado" : item.nombre}</h3>
                    {item.porcion && <p>Porciones: {item.porcion}</p>}
                    <p>Precio unitario: ${item.precio}</p>

                    {item.esPersonalizado && (
                      <div className="detalle-personalizado">
                        {Object.entries(item.detalle).map(([k, v]) => (
                          <p key={k}><strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : v}</p>
                        ))}
                      </div>
                    )}

                    <div className="cantidad-controles">
                      <button onClick={() => cambiarCantidad(clave, -1)}><FaMinus /></button>
                      <span>{item.cantidad || 1}</span>
                      <button onClick={() => cambiarCantidad(clave, 1)}><FaPlus /></button>
                    </div>
                    <p className="subtotal">
                      Subtotal: ${item.precio * (item.cantidad || 1)}
                    </p>
                  </div>
                  <button className="item-eliminar" onClick={() => eliminarItem(clave)} title="Eliminar producto">
                    <FaTrash size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="carrito-footer">
          <p className="carrito-total">Total: ${total}</p>
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