import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Carrito.css";

export default function Carrito({ carrito, setCarrito, abrir, setAbrir }) {
  const [procesando, setProcesando] = useState(false);
  const navigate = useNavigate();

  // ===========================
  //   DESACTIVAR SCROLL / ESC
  // ===========================
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
  }, [abrir, setAbrir]);

  // ===========================
  //     VACÍAR CARRITO
  // ===========================
  const vaciarCarrito = () => {
    const items = document.querySelectorAll(".carrito-item");
    items.forEach((el) => el.classList.add("eliminando"));

    setTimeout(() => {
      setCarrito([]);
      localStorage.removeItem("carrito"); // ← persistencia REAL
      window.dispatchEvent(new Event("carrito:actualizado"));
    }, 300);
  };

  // ===========================
  //   GENERADOR DE CLAVE
  // ===========================
  const getKey = (item) =>
    `${item.sku || item.id || item.nombre}-${item.porcion || 0}`;

  // ===========================
  //   SUMAR / RESTAR CANTIDAD
  // ===========================
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
    localStorage.setItem("carrito", JSON.stringify(actualizado)); // ← persistencia
    window.dispatchEvent(new Event("carrito:actualizado"));
  };

  // ===========================
  //    ELIMINAR ITEM
  // ===========================
  const eliminarItem = (clave) => {
    const elemento = document.getElementById(`item-${clave}`);
    if (elemento) elemento.classList.add("eliminando");

    setTimeout(() => {
      const actualizado = carrito.filter((item) => getKey(item) !== clave);
      setCarrito(actualizado);
      localStorage.setItem("carrito", JSON.stringify(actualizado)); // ← persistencia
      window.dispatchEvent(new Event("carrito:actualizado"));
    }, 250);
  };

  const cerrarCarrito = () => setAbrir(false);

  // ===========================
  //        TOTAL
  // ===========================
  const total = carrito.reduce((acc, item) => {
    const precio = Number(item.precio || 0);
    const cant = Number(item.cantidad || 1);
    return acc + precio * cant;
  }, 0);

  // ===========================
  //   FINALIZAR / CREAR PEDIDO
  // ===========================
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

      const baseUrl =
        import.meta.env.VITE_API_URL ?? "http://localhost:5000";

      //===============================
      //   CREAR PEDIDO EN BACKEND
      //===============================
      const res = await fetch(`${baseUrl}/api/pedidos/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id,
          estado: "pendiente",
          codigo_descuento: null,
          fecha_entrega: null,

          // Productos del catálogo
          detalle: carrito
            .filter((i) => !i.esPersonalizado)
            .map((i) => ({
              sku: i.sku,
              cantidad: i.cantidad,
              porcion: i.porcion,
            })),

          // Postres personalizados
          personalizados: carrito
            .filter((i) => i.esPersonalizado)
            .map((i) => ({
              tipo: i.tipo,
              cantidad: i.cantidad,
              bizcocho: i.detalle?.bizcocho,
              relleno: i.detalle?.relleno,
              cobertura: i.detalle?.cobertura,
              toppings: i.detalle?.toppings,
              mensaje: i.detalle?.mensaje,
              decoracion: i.detalle?.decoracion,
              precio_unitario: i.precio,
            })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "No se pudo crear el pedido.");
        return;
      }

      // Guardar carrito para la siguiente vista
      localStorage.setItem("carrito", JSON.stringify(carrito));
      window.dispatchEvent(new Event("carrito:actualizado"));
      setAbrir(false);

      // Ir al resumen (que luego abre MercadoPago)
      navigate("/resumen-compra", {
        state: { id_pedido: data.id_pedido, carrito },
      });
    } catch (error) {
      console.error("Error al crear pedido:", error);
      alert("Hubo un problema. Intenta nuevamente.");
    } finally {
      setProcesando(false);
    }
  };

  // ===========================
  //           JSX
  // ===========================
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
                      {item.esPersonalizado
                        ? "🍰 Postre personalizado"
                        : item.nombre}
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
          <p className="carrito-total">
            Total: ${total.toLocaleString("es-CL")}
          </p>
          <button className="vaciar-btn" onClick={vaciarCarrito}>
            <FaTrash /> Vaciar Carrito
          </button>
          <button
            className="finalizar-btn"
            disabled={procesando}
            onClick={finalizarCompra}
          >
            {procesando ? "Procesando..." : "Ir a pagar"}
          </button>
        </div>
      </aside>
    </>
  );
}