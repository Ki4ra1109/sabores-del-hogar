import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaTrash } from "react-icons/fa";
import "./Carrito.css";

export default function Carrito({ abrir, setAbrir }) {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("carrito") || "[]");
    setCarrito(saved);
    const handler = () => {
      const nuevo = JSON.parse(localStorage.getItem("carrito") || "[]");
      setCarrito(nuevo);
    };
    window.addEventListener("carrito:agregado", handler);
    return () => window.removeEventListener("carrito:agregado", handler);
  }, []);

  useEffect(() => {
    if (!abrir) return;
    const onKey = (e) => e.key === "Escape" && setAbrir(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [abrir]);

  const setAndPersist = (items) => {
    setCarrito(items);
    localStorage.setItem("carrito", JSON.stringify(items));
  };

  const disminuirCantidad = (id) => {
    const nuevo = carrito.map((x) =>
      x.id === id ? { ...x, cantidad: Math.max(1, x.cantidad - 1) } : x
    );
    setAndPersist(nuevo);
  };

  const aumentarCantidad = (id) => {
    const nuevo = carrito.map((x) =>
      x.id === id ? { ...x, cantidad: x.cantidad + 1 } : x
    );
    setAndPersist(nuevo);
  };

  const vaciarCarrito = () => {
    setAndPersist([]);
  };

  const cerrarCarrito = () => setAbrir(false);

  const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

  const ui = (
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
              <div key={item.id} className="carrito-item">
                <img src={item.imagen} alt={item.nombre} />
                <div className="info-item">
                  <h3>{item.nombre}</h3>

                  <div className="qty-row" aria-label="Cantidad">
                    <button
                      className="qty"
                      aria-label="Disminuir cantidad"
                      onClick={() => disminuirCantidad(item.id)}
                    >
                      −
                    </button>
                    <span className="qty-num" aria-live="polite">
                      {item.cantidad}
                    </span>
                    <button
                      className="qty"
                      aria-label="Aumentar cantidad"
                      onClick={() => aumentarCantidad(item.id)}
                    >
                      +
                    </button>
                  </div>

                  <p>
                    Precio: $
                    {(item.precio * item.cantidad).toLocaleString("es-CL")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="carrito-footer">
          <p className="carrito-total">Total: ${total.toLocaleString("es-CL")}</p>
          <button className="vaciar-btn" onClick={vaciarCarrito}>
            <FaTrash /> Vaciar Carrito
          </button>
          <button className="finalizar-btn">Finalizar Compra</button>
        </div>
      </aside>
    </>
  );

  return createPortal(ui, document.body);
}
