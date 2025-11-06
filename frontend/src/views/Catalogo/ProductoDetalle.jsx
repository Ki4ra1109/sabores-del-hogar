import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import "./ProductoDetalle.css";

export default function ProductoDetalle() {
  const { sku } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const PORCIONES_VALIDAS = [12, 18, 24, 30, 50];
  const [porcion, setPorcion] = useState(PORCIONES_VALIDAS[0]);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    setLoading(true);
    fetch(`${baseUrl}/api/productos/${sku}`)
      .then((res) => {
        if (!res.ok) throw new Error("Producto no encontrado");
        return res.json();
      })
      .then((data) => {
        setProducto(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando producto:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [sku]);

  // Regla:
  // - 12 personas => usar precio base de la BD (ya incluye ganancia)
  // - >=18 personas => precio = porciones*1000 + ganancia_fija
  //   donde ganancia_fija = max(0, precioBase - 12000)
  const precioCalculado = useMemo(() => {
    if (!producto) return 0;
    const precioBase = Number(producto.precio) || 0;
    const gananciaFija = Math.max(0, precioBase - 12000);

    if (Number(porcion) === 12) {
      return Math.round(precioBase);
    }
    const total = (Number(porcion) * 1000) + gananciaFija;
    return Math.round(total);
  }, [producto, porcion]);

  const handleAgregarCarrito = async () => {
    try {
      const rawUser = localStorage.getItem("sdh_user");
      if (!rawUser) {
        setMensaje("Debes iniciar sesión para agregar al carrito");
        return;
      }
      const user = JSON.parse(rawUser);
      const id_usuario = user.id_usuario ?? user.id ?? user.userId ?? user.idUser;
      if (!id_usuario) {
        setMensaje("Usuario inválido, inicia sesión nuevamente");
        return;
      }

      const nuevoItem = {
        sku: producto.sku,
        nombre: producto.nombre,
        precio: precioCalculado,
        cantidad,
        porcion,
        imagen: producto.imagen_url || "/placeholder.jpg",
      };

      const carritoActual = JSON.parse(localStorage.getItem("carrito") || "[]");
      const existe = carritoActual.findIndex(
        (p) => p.sku === nuevoItem.sku && p.porcion === nuevoItem.porcion
      );

      if (existe >= 0) {
        carritoActual[existe].cantidad += cantidad;
      } else {
        carritoActual.push(nuevoItem);
      }

      localStorage.setItem("carrito", JSON.stringify(carritoActual));
      window.dispatchEvent(new CustomEvent("carrito:agregado"));
      setMensaje("Producto agregado al carrito ✅");
    } catch (err) {
      console.error(err);
      setMensaje("No se pudo agregar al carrito ❌");
    }
  };

  if (loading) return null;

  if (error || !producto) {
    return (
      <>
        <Header />
        <div className="detalle-fallback">
          <h2>{error || "Producto no encontrado"}</h2>
          <button className="btn-volver" onClick={() => navigate("/catalogo")}>
            Volver al catálogo
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const safeSrc = (() => {
    const img = (producto.imagen_url || "").trim();
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return img;
    return "/placeholder.jpg";
  })();

  return (
    <div className="detalle-page">
      <Header />
      <div className="detalle-wrap">
        <div className="detalle-img">
          <img
            src={safeSrc}
            alt={producto.nombre}
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
          />
        </div>

        <div className="detalle-info">
          <h1 className="detalle-title">{producto.nombre.toUpperCase()}</h1>

          <p className="detalle-desc">
            {producto.descripcion ||
              "Torta elaborada artesanalmente. Selecciona el tamaño al comprar."}
          </p>

          <div className="selector-porciones">
            <label htmlFor="select-porciones" className="selector-label">
              Cantidad de personas
            </label>
            <select
              id="select-porciones"
              className="selector-select"
              value={porcion}
              onChange={(e) => setPorcion(Number(e.target.value))}
            >
              {PORCIONES_VALIDAS.map((p) => (
                <option key={p} value={p}>
                  {p} personas
                </option>
              ))}
            </select>
            <div className="selector-resumen">
              Seleccionaste: <strong>{porcion} personas</strong>
            </div>
          </div>

          <div className="detalle-precios">
            <p>
              <strong>Precio Total:</strong>{" "}
              ${precioCalculado.toLocaleString("es-CL")}
            </p>
          </div>


          <button className="btn-comprar" onClick={handleAgregarCarrito} style={{ marginTop: 12 }}>
            🛒 Agregar al Carrito
          </button>

          {mensaje && (
            <p style={{ marginTop: "10px", color: "#663f13" }}>{mensaje}</p>
          )}

          <p className="detalle-safe">Venta segura a través de la plataforma</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
