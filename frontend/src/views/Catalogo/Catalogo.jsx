import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from '../../componentes/Header';
import { Footer } from '../../componentes/Footer';
import './Catalogo.css';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const irAlProducto = (sku) => navigate(`/catalogo/${sku}`);

  const cat = new URLSearchParams(location.search).get('cat'); // "tortas", "dulces"

  // 🔹 Helper: obtener un precio “mostrable” desde variantes o campos legacy
  const getPrecioMostrar = (p) => {
    try {
      const variantes = Array.isArray(p.variantes) ? p.variantes : [];

      // 1) preferir variante de 12 personas
      const v12 = variantes.find(v => Number(v.personas) === 12 && Number.isFinite(Number(v.precio)));
      if (v12) return Number(v12.precio);

      // 2) si no hay 12p, tomar el mínimo precio disponible entre variantes
      if (variantes.length > 0) {
        const min = variantes
          .map(v => Number(v?.precio))
          .filter(n => Number.isFinite(n))
          .reduce((a, b) => Math.min(a, b), Infinity);
        if (Number.isFinite(min)) return min;
      }

      // 3) fallback a campos simples del producto
      if (Number.isFinite(Number(p.precio))) return Number(p.precio);
      if (Number.isFinite(Number(p.precioMin))) return Number(p.precioMin);

      return 0;
    } catch {
      return 0;
    }
  };

  // Filtrar por categoría
  const lista = useMemo(() => {
    if (!cat) return productos;
    return productos.filter(p => p.categoria === cat);
  }, [cat, productos]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/productos")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error al cargar productos:", err));
  }, []);

  return (
    <div className="productos-container">
      <Header />
      <div className="catalogo-body">
        <h1>
          {cat === 'tortas' ? 'Nuestro Catálogo de Tortas'
            : cat === 'dulces' ? 'Nuestro Catálogo de Dulces'
            : 'Nuestro Catálogo'}
        </h1>

        <div className="productos-grid">
          {lista.map(producto => {
            const precio = getPrecioMostrar(producto);
            return (
              <div
                key={producto.sku}
                className="producto-card"
                onClick={() => irAlProducto(producto.sku)}
              >
                <img src={producto.imagen_url} alt={producto.nombre} />
                <h2>{producto.nombre}</h2>
                <p className="precio">
                  {precio > 0 ? `$${precio.toLocaleString("es-CL")}` : "$"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}