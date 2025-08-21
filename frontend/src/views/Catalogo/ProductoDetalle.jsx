import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productos from "../../data/productos";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import "./ProductoDetalle.css";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const producto = productos.find(p => String(p.id) === String(id));

  if (!producto) {
    return (
      <>
        <Header />
        <div className="detalle-fallback">
          <h2>Producto no encontrado</h2>
          <button className="btn-volver" onClick={() => navigate("/Catalogo")}>
            Volver al catálogo
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const safeSrc = (() => {
    const img = (producto.imagen || "").trim();
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return img;
    return "/placeholder.jpg";
  })();

  const ALLOWED_PORCIONES = [12, 18, 24, 30, 50];

  const opcionesPorciones = useMemo(() => {
    if (Array.isArray(producto.variantes) && producto.variantes.length > 0) {
      const delProducto = [...new Set(producto.variantes.map(v => v.personas))];
      const inter = ALLOWED_PORCIONES.filter(p => delProducto.includes(p));
      return inter.length ? inter : ALLOWED_PORCIONES;
    }
    return ALLOWED_PORCIONES;
  }, [producto]);

  const [porcion, setPorcion] = useState(opcionesPorciones[0]);

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
            onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
          />
        </div>

        <div className="detalle-info">
          <h1 className="detalle-title">{producto.nombre.toUpperCase()}</h1>
          <p className="detalle-rango">{producto.precio}</p>
          <p className="detalle-desc">
            Torta elaborada artesanalmente. Selecciona el tamaño al comprar.
          </p>

          <div className="selector-porciones">
            <label htmlFor="select-porciones" className="selector-label">Porciones</label>
            <select
              id="select-porciones"
              className="selector-select"
              value={porcion}
              onChange={(e) => setPorcion(Number(e.target.value))}
            >
              {opcionesPorciones.map(p => (
                <option key={p} value={p}>{p} personas</option>
              ))}
            </select>
            <div className="selector-resumen">
              Seleccionaste: <strong>{porcion} personas</strong>
            </div>
          </div>

          <div className="detalle-precios">
            <p><strong>Precio Normal:</strong> {producto.precio}</p>
          </div>

          <p className="detalle-safe">Venta segura a través de la plataforma</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
