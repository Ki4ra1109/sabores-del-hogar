import React, { useEffect } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Carrito.css";

export default function Carrito({ carrito, setCarrito, abrir, setAbrir }) {
  const navigate = useNavigate();

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
    window.dispatchEvent(new Event("carrito:actualizado"));
  };

  const eliminarItem = (clave) => {
    const elemento = document.getElementById(`item-${clave}`);
    if (elemento) elemento.classList.add("eliminando");

    setTimeout(() => {
      const actualizado = carrito.filter((item) => getKey(item) !== clave);
      setCarrito(actualizado);
      window.dispatchEvent(new Event("carrito:actualizado"));
    }, 250);
  };

  const cerrarCarrito = () => setAbrir(false);

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * (item.cantidad || 1),
    0
  );

  // 🔥 NUEVO: Finalizar compra y guardar en DB
  const finalizarCompra = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("sdh_user"));
      if (!user?.id_usuario) return alert("Debes iniciar sesión para finalizar la compra");

      const productos = carrito.map((item) => ({
        sku: item.sku,
        cantidad: item.cantidad || 1,
        precio: item.precio,
        porcion: item.porcion || null,
      }));

      await axios.post("http://localhost:3000/api/carrito/finalizar", {
        id_usuario: user.id_usuario,
        productos,
      });

      // Limpiar carrito y redirigir
      setCarrito([]);
      window.dispatchEvent(new Event("carrito:actualizado"));
      navigate("/pedido-exitoso");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al finalizar la compra.");
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
              return (
                <div key={clave} id={`item-${clave}`} className="carrito-item">
                  <img src={item.imagen} alt={item.nombre} />
                  <div className="info-item">
                    <h3>{item.nombre}</h3>
                    {item.porcion && <p>Porciones: {item.porcion}</p>}
                    <p>Precio unitario: ${item.precio}</p>
                    <div className="cantidad-controles">
                      <button onClick={() => cambiarCantidad(clave, -1)}>
                        <FaMinus />
                      </button>
                      <span>{item.cantidad || 1}</span>
                      <button onClick={() => cambiarCantidad(clave, 1)}>
                        <FaPlus />
                      </button>
                    </div>
                    <p className="subtotal">
                      Subtotal: ${item.precio * (item.cantidad || 1)}
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
          <p className="carrito-total">Total: ${total}</p>
          <button className="vaciar-btn" onClick={vaciarCarrito}>
            <FaTrash /> Vaciar Carrito
          </button>
          <button className="finalizar-btn" onClick={finalizarCompra}>
            Finalizar Compra
          </button>
        </div>
      </aside>
    </>
  );
}