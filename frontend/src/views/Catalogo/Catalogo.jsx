// src/views/Catalogo/Catalogo.jsx
import { Footer } from '../../componentes/Footer';
import { Header } from '../../componentes/Header';
import productos from '../../data/productos';
import './Catalogo.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export default function Catalogo() {
  const navigate = useNavigate();
  const location = useLocation();

  const irAlProducto = (id) => navigate(`/catalogo/${id}`);

  const cat = new URLSearchParams(location.search).get('cat'); // "tortas"  "dulces" 
  const lista = useMemo(() => {
    if (!cat) return productos;
    return productos.filter(p => p.categoria === cat);
  }, [cat]);

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
              key={producto.id}
              className="producto-card"
              onClick={() => irAlProducto(producto.id)}
            >
              <img src={producto.imagen} alt={producto.nombre} />
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
