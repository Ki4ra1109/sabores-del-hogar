import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from '../../componentes/Header';
import { Footer } from '../../componentes/Footer';
import './Catalogo.css';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const irAlProducto = (sku) => navigate(`/catalogo/${sku}`);
  const cat = new URLSearchParams(location.search).get('cat'); // "tortas", "dulces"

  // Filtrar por categoría
  const lista = useMemo(() => {
    if (!cat) return productos;
    return productos.filter(p => p.categoria === cat);
  }, [cat, productos]);

  // Traer productos desde el backend
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/productos")
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!productos.length) return <p>No hay productos disponibles.</p>;

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
          {lista.map(producto => (
            <div
              key={producto.sku}
              className="producto-card"
              onClick={() => irAlProducto(producto.sku)}
            >
              <img src={producto.imagen_url} alt={producto.nombre} />
              <h2>{producto.nombre}</h2>
              <p className="precio">${producto.precio}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
