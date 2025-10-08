import React, { useEffect } from "react";
import { FaTimes, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "./Carrito.css";

export default function Carrito({ carrito, setCarrito, abrir, setAbrir }) {
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

  // ✅ Vaciar carrito completamente
  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem("carrito");
    window.dispatchEvent(new Event("carrito:actualizado")); // 🔔 Notifica al Header
  };

  // ✅ Eliminar un solo producto con animación
  const eliminarItem = (id) => {
    const elemento = document.getElementById(`item-${id}`);
    if (elemento) {
      elemento.classList.add("eliminando");
      setTimeout(() => {
        const actualizado = carrito.filter((item) => item.id !== id);
        setCarrito(actualizado);
        localStorage.setItem("carrito", JSON.stringify(actualizado));
        window.dispatchEvent(new Event("carrito:actualizado")); // 🔔 Notifica al Header
      }, 250);
    }
  };

  // ✅ Aumentar / disminuir cantidad
  const cambiarCantidad = (id, delta) => {
    const actualizado = carrito.map((item) =>
      item.id === id
        ? { ...item, cantidad: Math.max(1, (item.cantidad || 1) + delta) }
        : item
    );
    setCarrito(actualizado);
    localStorage.setItem("carrito", JSON.stringify(actualizado));
    window.dispatchEvent(new Event("carrito:actualizado")); // 🔔 Notifica al Header
  };

  const cerrarCarrito = () => setAbrir(false);

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * (item.cantidad || 1),
    0
  );

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
          <button className="cerrar-btn" onClick={cerrarCarrito}>
            <FaTimes size={20} />
          </button>
        </div>

        {carrito.length === 0 ? (
          <p className="carrito-vacio">El carrito está vacío</p>
        ) : (
          <div className="carrito-body">
            {carrito.map((item) => (
              <div key={item.id} className="carrito-item" id={`item-${item.id}`}>
                <img src={item.imagen} alt={item.nombre} />
                <div className="info-item">
                  <h3>{item.nombre}</h3>
                  <p>Precio unitario: ${item.precio}</p>
                  <div className="cantidad-controles">
                    <button onClick={() => cambiarCantidad(item.id, -1)}>
                      <FaMinus />
                    </button>
                    <span>{item.cantidad || 1}</span>
                    <button onClick={() => cambiarCantidad(item.id, 1)}>
                      <FaPlus />
                    </button>
                  </div>
                  <p className="subtotal">
                    Subtotal: ${item.precio * (item.cantidad || 1)}
                  </p>
                </div>
                <button
                  className="item-eliminar"
                  onClick={() => eliminarItem(item.id)}
                  title="Eliminar producto"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="carrito-footer">
          <p className="carrito-total">Total: ${total}</p>
          <button className="vaciar-btn" onClick={vaciarCarrito}>
            <FaTrash /> Vaciar Carrito
          </button>
          <button className="finalizar-btn">Finalizar Compra</button>
        </div>
      </aside>
    </>
  );
}