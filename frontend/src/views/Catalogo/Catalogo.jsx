import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../componentes/Header";
import { Footer } from "../../componentes/Footer";
import "./Catalogo.css";

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const irAlProducto = (sku) => navigate(`/catalogo/${sku}`);

  const cat = new URLSearchParams(location.search).get("cat");

  const getRangoPrecios = (p) => {
    try {
      const variantesBase = Array.isArray(p.variantes) ? p.variantes : [];
      const porcionesBase = Array.isArray(p.porciones) ? p.porciones : [];
      const variantes = variantesBase.length ? variantesBase : porcionesBase;

      let precios = variantes
        .map((v) => Number(v?.precio))
        .filter((n) => Number.isFinite(n));

      if (!precios.length) {
        if (Number.isFinite(Number(p.precio))) precios.push(Number(p.precio));
        if (Number.isFinite(Number(p.precioMin))) precios.push(Number(p.precioMin));
      }

      if (!precios.length) return { min: 0, max: 0 };

      const min = Math.min(...precios);
      const max = Math.max(...precios);
      return { min, max };
    } catch {
      return { min: 0, max: 0 };
    }
  };

  const lista = useMemo(() => {
    if (!cat) return productos;
    return productos.filter((p) => p.categoria === cat);
  }, [cat, productos]);

  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:5000/api/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error al cargar productos:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatoCLP = (n) =>
    typeof n === "number" && Number.isFinite(n)
      ? `$${n.toLocaleString("es-CL")}`
      : "$";

  return (
    <div className="productos-container">
      <Header />
      <div className="catalogo-body">
        <h1>
          {cat === "tortas"
            ? "Nuestro Catálogo de Tortas"
            : cat === "dulces"
            ? "Nuestro Catálogo de Dulces"
            : "Nuestro Catálogo"}
        </h1>

        {loading ? (
          <div className="productos-grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="producto-card skeleton-card">
                <div className="skeleton-thumb" />
                <div className="skeleton-line skeleton-line-lg" />
                <div className="skeleton-line skeleton-line-sm" />
              </div>
            ))}
          </div>
        ) : lista.length === 0 ? (
          <div className="productos-empty">
            No hay productos disponibles en esta categoría.
          </div>
        ) : (
          <div className="productos-grid">
            {lista.map((producto) => {
              const { min, max } = getRangoPrecios(producto);
              const textoPrecio =
                min && max && min !== max
                  ? `${formatoCLP(min)} - ${formatoCLP(max)}`
                  : formatoCLP(min || max);

              return (
                <div
                  key={producto.sku}
                  className="producto-card"
                  onClick={() => irAlProducto(producto.sku)}
                >
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    loading="lazy"
                  />
                  <h2>{producto.nombre}</h2>
                  <p className="precio">{textoPrecio}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}