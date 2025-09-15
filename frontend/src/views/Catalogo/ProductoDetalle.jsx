import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import "./ProductoDetalle.css";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === Hooks que no dependen de condiciones ===
  const ALLOWED_PORCIONES = [12, 18, 24, 30, 50];
  const [porcion, setPorcion] = useState(ALLOWED_PORCIONES[0]);

  // === Fetch al cargar ===
  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/productos/${id}`)
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
  }, [id]);

  // Calculamos opciones de porciones con seguridad
  const opcionesPorciones = useMemo(() => {
    if (producto && Array.isArray(producto.variantes) && producto.variantes.length > 0) {
      const delProducto = [...new Set(producto.variantes.map((v) => v.personas))];
      const inter = ALLOWED_PORCIONES.filter((p) => delProducto.includes(p));
      return inter.length ? inter : ALLOWED_PORCIONES;
    }
    return ALLOWED_PORCIONES;
  }, [producto]);

  // Ajustar porción si cambia el producto
  useEffect(() => {
    setPorcion(opcionesPorciones[0]);
  }, [opcionesPorciones]);

  // === Returns condicionales ===
  if (loading) return <p style={{ padding: "2rem" }}>Cargando producto...</p>;

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

  // Imagen segura
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
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
        </div>

        <div className="detalle-info">
          <h1 className="detalle-title">{producto.nombre.toUpperCase()}</h1>
          <p className="detalle-rango">${producto.precio}</p>
          <p className="detalle-desc">
            {producto.descripcion || "Torta elaborada artesanalmente. Selecciona el tamaño al comprar."}
          </p>

          <div className="selector-porciones">
            <label htmlFor="select-porciones" className="selector-label">
              Porciones
            </label>
            <select
              id="select-porciones"
              className="selector-select"
              value={porcion}
              onChange={(e) => setPorcion(Number(e.target.value))}
            >
              {opcionesPorciones.map((p) => (
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
              <strong>Precio Normal:</strong> ${producto.precio}
            </p>
          </div>

          <p className="detalle-safe">Venta segura a través de la plataforma</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
