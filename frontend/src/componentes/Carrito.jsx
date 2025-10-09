import React, { useEffect } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
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

  // Vaciar carrito completo
  const vaciarCarrito = () => {
    const items = document.querySelectorAll(".carrito-item");
    items.forEach((el) => el.classList.add("eliminando"));

    setTimeout(() => {
      setCarrito([]);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("carrito:actualizado"));
    }, 300);
  };

  // Cambiar cantidad solo del item específico
  const cambiarCantidad = (sku, porcion, delta) => {
    const actualizado = carrito
      .map((item) => {
        if (item.sku === sku && item.porcion === porcion) {
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

  // Eliminar item específico
  const eliminarItem = (sku, porcion) => {
    const elemento = document.getElementById(`item-${sku}-${porcion}`);
    if (elemento) elemento.classList.add("eliminando");

    setTimeout(() => {
      const actualizado = carrito.filter(
        (item) => !(item.sku === sku && item.porcion === porcion)
      );
      setCarrito(actualizado);
      localStorage.setItem("carrito", JSON.stringify(actualizado));
      window.dispatchEvent(new Event("carrito:actualizado"));
    }, 250);
  };

  const cerrarCarrito = () => setAbrir(false);

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * (item.cantidad || 1),
    0
  );

  return (
    <>
      <div className={`carrito-overlay ${abrir ? "activo" : ""}`} onClick={cerrarCarrito} />
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
            {carrito.map((item) => (
              <div
                key={`${item.sku}-${item.porcion}`}
                id={`item-${item.sku}-${item.porcion}`}
                className="carrito-item"
              >
                <img src={item.imagen} alt={item.nombre} />
                <div className="info-item">
                  <h3>{item.nombre}</h3>
                  {item.porcion && <p>Porciones: {item.porcion}</p>}
                  <p>Precio unitario: ${item.precio}</p>
                  <div className="cantidad-controles">
                    <button onClick={() => cambiarCantidad(item.sku, item.porcion, -1)}>
                      <FaMinus />
                    </button>
                    <span>{item.cantidad || 1}</span>
                    <button onClick={() => cambiarCantidad(item.sku, item.porcion, 1)}>
                      <FaPlus />
                    </button>
                  </div>
                  <p className="subtotal">
                    Subtotal: ${item.precio * (item.cantidad || 1)}
                  </p>
                </div>
                <button
                  className="item-eliminar"
                  onClick={() => eliminarItem(item.sku, item.porcion)}
                  title="Eliminar producto"
                >
                  <FaTrash size={18} />
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
